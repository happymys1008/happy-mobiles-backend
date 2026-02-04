import Inventory from "../models/Inventory.model.js";
import mongoose from "mongoose";

const createHttpError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

const applyLowStockFlag = async (doc) => {
  if (!doc) return doc;
  const threshold = Number(doc.lowStockThreshold ?? 5);
  const lowStock = Number(doc.qty ?? 0) < threshold;
  if (doc.lowStock !== lowStock) {
    doc.lowStock = lowStock;
    await doc.save();
  }
  return doc;
};

export const listInventory = async () => {
  return Inventory.find();
};

export const listLowStockInventory = async () => {
  return Inventory.find({ lowStock: true });
};

export const reserveInventory = async ({ productId, variantId, qty }) => {
  if (!productId || !variantId) {
    throw createHttpError(400, "productId and variantId are required");
  }

  const requestedQty = Number(qty);
  if (!Number.isFinite(requestedQty) || requestedQty < 1) {
    throw createHttpError(400, "qty must be at least 1");
  }

  const updated = await Inventory.findOneAndUpdate(
    { productId, variantId, qty: { $gte: requestedQty } },
    { $inc: { qty: -requestedQty } },
    { new: true }
  );

  if (!updated) {
    throw createHttpError(409, "Insufficient stock");
  }

  return applyLowStockFlag(updated);
};

export const adjustInventory = async ({ productId, variantId, qty }) => {
  if (!productId || !variantId) {
    throw createHttpError(400, "productId and variantId are required");
  }

  const requestedQty = Number(qty);
  if (!Number.isFinite(requestedQty) || requestedQty === 0) {
    throw createHttpError(400, "qty must be non-zero");
  }

  if (requestedQty > 0) {
    const updated = await Inventory.findOneAndUpdate(
      { productId, variantId },
      { $inc: { qty: requestedQty } },
      { new: true, upsert: true }
    );
    return applyLowStockFlag(updated);
  }

  const decrement = Math.abs(requestedQty);
  const updated = await Inventory.findOneAndUpdate(
    { productId, variantId, qty: { $gte: decrement } },
    { $inc: { qty: -decrement } },
    { new: true }
  );

  if (!updated) {
    throw createHttpError(409, "Insufficient stock");
  }

  return applyLowStockFlag(updated);
};

const normalizeItems = (items) =>
  items
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      qty: Number(item.qty),
    }))
    .filter(
      (item) =>
        item.productId &&
        item.variantId &&
        Number.isFinite(item.qty) &&
        item.qty > 0
    );

export const commitInventory = async ({ items }) => {
  const normalized = normalizeItems(items || []);
  if (normalized.length === 0) {
    throw createHttpError(400, "items are required");
  }

  const session = await mongoose.startSession();
  try {
    let updatedDocs = [];
    await session.withTransaction(async () => {
      for (const item of normalized) {
        const updated = await Inventory.findOneAndUpdate(
          {
            productId: item.productId,
            variantId: item.variantId,
            qty: { $gte: item.qty },
          },
          { $inc: { qty: -item.qty } },
          { new: true, session }
        );

        if (!updated) {
          throw createHttpError(409, "Insufficient stock");
        }

        updatedDocs.push(await applyLowStockFlag(updated));
      }
    });
    return updatedDocs;
  } catch (err) {
    const msg = String(err?.message || "");
    const isTxnUnsupported =
      msg.includes("Transaction") ||
      msg.includes("replica set") ||
      msg.includes("retryable writes are not supported");

    if (!isTxnUnsupported) {
      throw err;
    }
  } finally {
    session.endSession();
  }

  const decremented = [];
  try {
    for (const item of normalized) {
      const updated = await Inventory.findOneAndUpdate(
        {
          productId: item.productId,
          variantId: item.variantId,
          qty: { $gte: item.qty },
        },
        { $inc: { qty: -item.qty } },
        { new: true }
      );

      if (!updated) {
        throw createHttpError(409, "Insufficient stock");
      }

      decremented.push({ item, updated: await applyLowStockFlag(updated) });
    }

    return decremented.map((d) => d.updated);
  } catch (err) {
    await Promise.all(
      decremented.map(({ item }) =>
        Inventory.findOneAndUpdate(
          { productId: item.productId, variantId: item.variantId },
          { $inc: { qty: item.qty } }
        )
      )
    );
    throw err;
  }
};

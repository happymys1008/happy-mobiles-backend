import Inventory from "../models/Inventory.model.js";
import Product from "../models/Product.model.js";
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

/* ===============================
   LIST
================================ */
export const listInventory = async () => {
  return Inventory.find();
};

export const listLowStockInventory = async () => {
  return Inventory.find({ lowStock: true });
};

/* ===============================
   RESERVE INVENTORY (SALE)
================================ */
export const reserveInventory = async ({ productId, variantId, qty }) => {
  if (!productId) {
    throw createHttpError(400, "productId is required");
  }

  const requestedQty = Number(qty);
  if (!Number.isFinite(requestedQty) || requestedQty < 1) {
    throw createHttpError(400, "qty must be at least 1");
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw createHttpError(404, "Invalid product");
  }

  if (product.allowVariants && !variantId) {
    throw createHttpError(400, "variantId is required for this product");
  }

  const query = {
    productId,
    variantId: product.allowVariants ? variantId : null,
    qty: { $gte: requestedQty }
  };

  const updated = await Inventory.findOneAndUpdate(
    query,
    { $inc: { qty: -requestedQty } },
    { new: true }
  );

  if (!updated) {
    throw createHttpError(409, "Insufficient stock");
  }

  return applyLowStockFlag(updated);
};

/* ===============================
   ADJUST INVENTORY (PURCHASE / MANUAL)
================================ */
/* ===============================
   ADJUST INVENTORY (PURCHASE / MANUAL)
================================ */
export const adjustInventory = async ({
  productId,
  variantId,
  qty,
  imeis = []
}) => {
  if (!productId) {
    throw createHttpError(400, "productId is required");
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw createHttpError(404, "Invalid product");
  }

  if (product.allowVariants && !variantId) {
    throw createHttpError(400, "variantId is required for this product");
  }

  const query = {
    productId,
    variantId: product.allowVariants ? variantId : null
  };

  let inventory = await Inventory.findOne(query);

  if (!inventory) {
    inventory = await Inventory.create({
      productId,
      variantId: product.allowVariants ? variantId : null,
      trackingType: product.trackingType,
      qty: 0,
      imeis: [],
      serials: []
    });
  }

  /* ================= IMEI / SERIAL TRACKING ================= */
/* ================= IMEI TRACKING ================= */
if (product.trackingType === "IMEI") {

  if (!Array.isArray(imeis) || imeis.length === 0) {
    throw createHttpError(400, "IMEI numbers required");
  }

  inventory.imeis = [...inventory.imeis, ...imeis];
  inventory.imeis = [...new Set(inventory.imeis)];

  inventory.qty = inventory.imeis.length;

  await inventory.save();
  return applyLowStockFlag(inventory);
}

/* ================= SERIAL TRACKING ================= */
if (product.trackingType === "SERIAL") {

  if (!Array.isArray(imeis) || imeis.length === 0) {
    throw createHttpError(400, "Serial numbers required");
  }

  inventory.serials = [...inventory.serials, ...imeis];
  inventory.serials = [...new Set(inventory.serials)];

  inventory.qty = inventory.serials.length;

  await inventory.save();
  return applyLowStockFlag(inventory);
}


  /* ================= QTY TRACKING ================= */
  const requestedQty = Number(qty);
  if (!Number.isFinite(requestedQty) || requestedQty === 0) {
    throw createHttpError(400, "qty must be non-zero");
  }

  inventory.qty += requestedQty;

  if (inventory.qty < 0) {
    throw createHttpError(409, "Insufficient stock");
  }

  await inventory.save();
  return applyLowStockFlag(inventory);
};


/* ===============================
   NORMALIZE ITEMS
================================ */
const normalizeItems = (items) =>
  items
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      qty: Number(item.qty)
    }))
    .filter(
      (item) =>
        item.productId &&
        Number.isFinite(item.qty) &&
        item.qty > 0
    );

/* ===============================
   COMMIT INVENTORY (ORDER FINALIZE)
================================ */
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
        const product = await Product.findById(item.productId).lean();
        if (!product) {
          throw createHttpError(404, "Invalid product");
        }

        if (product.allowVariants && !item.variantId) {
          throw createHttpError(400, "variantId is required for this product");
        }

        const query = {
          productId: item.productId,
          variantId: product.allowVariants ? item.variantId : null,
          qty: { $gte: item.qty }
        };

        const updated = await Inventory.findOneAndUpdate(
          query,
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

  // 🔁 fallback (no transaction support)
  const decremented = [];
  try {
    for (const item of normalized) {
      const product = await Product.findById(item.productId).lean();
      if (!product) {
        throw createHttpError(404, "Invalid product");
      }

      const query = {
        productId: item.productId,
        variantId: product.allowVariants ? item.variantId : null,
        qty: { $gte: item.qty }
      };

      const updated = await Inventory.findOneAndUpdate(
        query,
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
          {
            productId: item.productId,
            variantId: item.variantId ?? null
          },
          { $inc: { qty: item.qty } }
        )
      )
    );
    throw err;
  }
};

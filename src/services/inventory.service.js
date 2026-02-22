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
export const reserveInventory = async ({
  productId,
  colorId = null,
  skuId = null,
  qty
}) => {
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

  if (product.hasVariants && !skuId) {
    throw createHttpError(400, "skuId is required for this product");
  }

  const query = {
    productId,
    colorId: product.hasVariants ? colorId : null,
    skuId: product.hasVariants ? skuId : null,
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
   ADJUST INVENTORY (PURCHASE)
================================ */
export const adjustInventory = async ({
  productId,
  colorId = null,
  skuId = null,
  qty,
  imeis = [],
  serials = []
}) => {
  if (!productId) {
    throw createHttpError(400, "productId is required");
  }

  const product = await Product.findById(productId).lean();
  if (!product) {
    throw createHttpError(404, "Invalid product");
  }

  if (product.hasVariants && !skuId) {
    throw createHttpError(400, "skuId is required for this product");
  }

  const query = {
    productId,
    colorId: product.hasVariants ? colorId : null,
    skuId: product.hasVariants ? skuId : null
  };

  /* ================= IMEI TRACKING ================= */
  if (product.trackingType === "IMEI") {
    if (!Array.isArray(imeis) || imeis.length === 0) {
      throw createHttpError(400, "IMEI numbers required");
    }

    const updated = await Inventory.findOneAndUpdate(
      query,
      {
        $addToSet: { imeis: { $each: imeis } },
        $setOnInsert: {
          trackingType: product.trackingType,
          serials: []
        }
      },
      { new: true, upsert: true }
    );

    updated.qty = updated.imeis.length;
    await updated.save();

    return applyLowStockFlag(updated);
  }

  /* ================= SERIAL TRACKING ================= */
  if (product.trackingType === "SERIAL") {
    if (!Array.isArray(serials) || serials.length === 0) {
      throw createHttpError(400, "Serial numbers required");
    }

    const updated = await Inventory.findOneAndUpdate(
      query,
      {
        $addToSet: { serials: { $each: serials } },
        $setOnInsert: {
          trackingType: product.trackingType,
          imeis: []
        }
      },
      { new: true, upsert: true }
    );

    updated.qty = updated.serials.length;
    await updated.save();

    return applyLowStockFlag(updated);
  }

  /* ================= QTY TRACKING ================= */
  const requestedQty = Number(qty);
  if (!Number.isFinite(requestedQty) || requestedQty === 0) {
    throw createHttpError(400, "qty must be non-zero");
  }

  const updated = await Inventory.findOneAndUpdate(
    query,
    {
      $inc: { qty: requestedQty },
      $setOnInsert: {
        trackingType: product.trackingType,
        imeis: [],
        serials: []
      }
    },
    { new: true, upsert: true }
  );

  if (updated.qty < 0) {
    throw createHttpError(409, "Insufficient stock");
  }

  return applyLowStockFlag(updated);
};

/* ===============================
   COMMIT INVENTORY (ORDER FINALIZE)
================================ */
export const commitInventory = async ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, "items are required");
  }

  const session = await mongoose.startSession();
  try {
    let updatedDocs = [];

    await session.withTransaction(async () => {
      for (const item of items) {
        const product = await Product.findById(item.productId).lean();
        if (!product) {
          throw createHttpError(404, "Invalid product");
        }

        if (product.hasVariants && !item.skuId) {
          throw createHttpError(400, "skuId required");
        }

        const query = {
          productId: item.productId,
          colorId: product.hasVariants ? item.colorId : null,
          skuId: product.hasVariants ? item.skuId : null,
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
  } finally {
    session.endSession();
  }
};
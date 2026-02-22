import Purchase from "../models/Purchase.model.js";
import { adjustInventory } from "../services/inventory.service.js";

/**
 * ===============================
 * CREATE PURCHASE (ADMIN)
 * ===============================
 */
export const createPurchase = async (req, res, next) => {
  try {
    const { invoiceNo, supplierId, invoiceDate, items } = req.body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Supplier & items are required"
      });
    }

    for (const item of items) {
      if (
        !item.productId ||
        !Number.isFinite(item.qty) ||
        item.qty <= 0
      ) {
        return res.status(400).json({
          message: "Invalid purchase item data"
        });
      }
    }

    const purchase = await Purchase.create({
      invoiceNo,
      supplierId,
      invoiceDate,
      items,
      status: "ACTIVE"
    });

    // ===============================
    // ADD STOCK (SKU-AWARE)
    // ===============================
    for (const item of items) {
      await adjustInventory({
        productId: item.productId,
        colorId: item.colorId || null,
        skuId: item.skuId || null,
        qty: item.qty,
        imeis: item.imeis || [],
        serials: item.serials || []
      });
    }

    res.status(201).json({
      message: "Purchase saved & inventory updated",
      purchaseId: purchase._id
    });

  } catch (err) {
    console.error("PURCHASE CREATE ERROR:", err);
    next(err);
  }
};
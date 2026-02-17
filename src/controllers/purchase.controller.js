import Purchase from "../models/Purchase.model.js";
import Inventory from "../models/Inventory.model.js";
import { adjustInventory } from "../services/inventory.service.js";

/**
 * ===============================
 * CREATE PURCHASE (ADMIN)
 * ===============================
 * ✔ MongoDB single source of truth
 * ✔ Stock ADD happens here
 */
export const createPurchase = async (req, res, next) => {
  try {
    const { invoiceNo, supplierId, invoiceDate, items } = req.body;

    // 🛑 BASIC VALIDATION
    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Supplier & items are required"
      });
    }

    // 🛑 ITEM LEVEL VALIDATION
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

    // ===============================
    // 1️⃣ SAVE PURCHASE (NO createdBy IN DEV MODE)
    // ===============================
    const purchase = await Purchase.create({
      invoiceNo,
      supplierId,
      invoiceDate,
      items,
      status: "ACTIVE"
    });

    // ===============================
    // 2️⃣ ADD STOCK
    // ===============================
for (const item of items) {
  await adjustInventory({
    productId: item.productId,
    variantId: item.variantId,
    qty: item.qty,
    imeis: item.imeis || []   // 🔥 THIS LINE IMPORTANT
  });
}


    // ===============================
    // 3️⃣ RESPONSE
    // ===============================
    res.status(201).json({
      message: "Purchase saved & inventory updated",
      purchaseId: purchase._id
    });
  } catch (err) {
    console.error("PURCHASE CREATE ERROR:", err);
    next(err);
  }
};

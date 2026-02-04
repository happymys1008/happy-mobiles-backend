import {
  listInventory,
  listLowStockInventory,
  adjustInventory,
  commitInventory,
  reserveInventory,
} from "../services/inventory.service.js";

export const getInventory = async (req, res, next) => {
  try {
    const inventory = await listInventory();
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const getLowStockInventory = async (req, res, next) => {
  try {
    const inventory = await listLowStockInventory();
    res.json(inventory);
  } catch (err) {
    next(err);
  }
};

export const reserveInventoryController = async (req, res, next) => {
  try {
    const { productId, variantId, qty } = req.body;
    const updated = await reserveInventory({ productId, variantId, qty });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const adjustInventoryController = async (req, res, next) => {
  try {
    const { productId, variantId, qty } = req.body;
    const updated = await adjustInventory({ productId, variantId, qty });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const commitInventoryController = async (req, res, next) => {
  try {
    const { items } = req.body;
    const updated = await commitInventory({ items });
    res.json({ items: updated });
  } catch (err) {
    next(err);
  }
};

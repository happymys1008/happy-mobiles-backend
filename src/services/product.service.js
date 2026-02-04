import Product from "../models/Product.model.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const listProducts = async ({ page, limit } = {}) => {
  const shouldPaginate = page !== null || limit !== null;

  if (!shouldPaginate) {
    return Product.find();
  }

  const safeLimit = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT);
  const safePage = page || 1;
  const skip = (safePage - 1) * safeLimit;

  return Product.find().skip(skip).limit(safeLimit);
};

import { listProducts } from "../services/product.service.js";

const parsePositiveInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const getProducts = async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page);
    const limit = parsePositiveInt(req.query.limit);

    const products = await listProducts({
      page,
      limit,
    });

    res.json(products);
  } catch (err) {
    next(err);
  }
};

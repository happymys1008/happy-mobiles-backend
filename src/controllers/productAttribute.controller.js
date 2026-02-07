import ProductAttribute from "../models/ProductAttribute.model.js";

/* GET ALL */
export const getAttributes = async (req, res) => {
  const attributes = await ProductAttribute.find().sort({ name: 1 });
  res.json(attributes);
};

/* CREATE ATTRIBUTE */
export const createAttribute = async (req, res) => {
  const { key, name } = req.body;

  const exists = await ProductAttribute.findOne({ key });
  if (exists) {
    return res.status(400).json({ message: "Attribute already exists" });
  }

  const attr = await ProductAttribute.create({
    key,
    name,
    values: []
  });

  res.status(201).json(attr);
};

/* ADD VALUE */
export const addAttributeValue = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const attr = await ProductAttribute.findOne({ key });
  if (!attr) {
    return res.status(404).json({ message: "Attribute not found" });
  }

  if (!attr.values.includes(value)) {
    attr.values.push(value);
    await attr.save();
  }

  res.json(attr);
};

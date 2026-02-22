import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";

async function migrate() {
  try {
    await connectDB();

    console.log("🚀 Migration started...");

    const db = mongoose.connection.db;
    const skus = await db.collection("skus").find({}).toArray();

    for (const sku of skus) {

      const attributes = {};

      if (sku.ram) attributes.ram = sku.ram;
      if (sku.storage) attributes.storage = sku.storage;

      const sortedKeys = Object.keys(attributes).sort();

      let hashString;

      if (sortedKeys.length === 0) {
        hashString = "default";
      } else {
        hashString = sortedKeys
          .map(key => `${key}:${attributes[key]}`)
          .join("|");
      }

      await db.collection("skus").updateOne(
        { _id: sku._id },
        {
          $set: {
            attributes,
            attributeHash: hashString
          },
          $unset: {
            ram: "",
            storage: ""
          }
        }
      );
    }

    console.log("✅ Migration complete");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

migrate();
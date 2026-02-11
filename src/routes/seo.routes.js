import express from "express";
import Product from "../models/Product.model.js";
import Category from "../models/Category.model.js";
import SubCategory from "../models/SubCategory.model.js";
import ChildCategory from "../models/ChildCategory.model.js";

const router = express.Router();

/* =========================================================
   🔥 SITEMAP.XML (Dynamic – Production Ready)
========================================================= */
router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const baseUrl = "https://www.varaii.com";

    const [products, categories, subCategories, childCategories] =
      await Promise.all([
        Product.find({ isActive: true }).select("slug _id"),
        Category.find().select("slug"),
        SubCategory.find().select("slug"),
        ChildCategory.find().select("slug")
      ]);

    let urls = [];

    /* ========= PRODUCTS ========= */
    products.forEach(p => {
      urls.push(`
        <url>
          <loc>${baseUrl}/product/${p.slug}/p/${p._id}</loc>
          <changefreq>daily</changefreq>
          <priority>0.8</priority>
        </url>
      `);
    });

    /* ========= CATEGORY ========= */
    categories.forEach(c => {
      urls.push(`
        <url>
          <loc>${baseUrl}/shop/${c.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `);
    });

    subCategories.forEach(s => {
      urls.push(`
        <url>
          <loc>${baseUrl}/shop/${s.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.6</priority>
        </url>
      `);
    });

    childCategories.forEach(ch => {
      urls.push(`
        <url>
          <loc>${baseUrl}/shop/${ch.slug}</loc>
          <changefreq>weekly</changefreq>
          <priority>0.5</priority>
        </url>
      `);
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${urls.join("")}
    </urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    next(err);
  }
});

/* =========================================================
   🔥 ROBOTS.TXT
========================================================= */
router.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Sitemap: https://www.varaii.com/sitemap.xml`);
});

export default router;

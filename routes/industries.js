const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { code, industry } = req.body;
    if (typeof code !== "string" || typeof industry !== "string") {
      throw new ExpressError(`Invalid types for code or industry`, 400);
    }
    const results = await db.query(
      `INSERT INTO industries (code, industries) VALUES ($1, $2) RETURNING code, industries`,
      [code, industry]
    );
    return res.json({ industry: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/link-codes", async (req, res, next) => {
  try {
    const { company_code, industry_code } = req.body;

    // Validate input
    if (
      typeof company_code !== "string" ||
      typeof industry_code !== "string" ||
      !company_code.trim() ||
      !industry_code.trim()
    ) {
      throw new ExpressError(
        `Invalid or missing company_code or industry_code`,
        400
      );
    }

    // Ensure company_code exists in companies table
    const companyExists = await db.query(
      `SELECT code FROM companies WHERE code = $1`,
      [company_code]
    );
    if (companyExists.rows.length === 0) {
      throw new ExpressError(
        `Company code '${company_code}' does not exist`,
        404
      );
    }

    // Ensure industry_code exists in industries table
    const industryExists = await db.query(
      `SELECT code FROM industries WHERE code = $1`,
      [industry_code]
    );
    if (industryExists.rows.length === 0) {
      throw new ExpressError(
        `Industry code '${industry_code}' does not exist`,
        404
      );
    }

    // Check if the link already exists
    const checkCodes = await db.query(
      `
            SELECT c.code, i.code 
            FROM companies AS c
            JOIN company_industries AS ci ON c.code = ci.company_code
            JOIN industries AS i ON ci.industry_code = i.code
            WHERE c.code = $1 AND i.code = $2
        `,
      [company_code, industry_code]
    );

    if (checkCodes.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "This company and industry are already linked." });
    }

    // Insert the new link
    const results = await db.query(
      `
            INSERT INTO company_industries (company_code, industry_code) 
            VALUES ($1, $2) 
            RETURNING company_code, industry_code
        `,
      [company_code, industry_code]
    );

    // Respond with the created link
    return res.status(201).json({
      message: "Link created successfully",
      link: results.rows[0],
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;

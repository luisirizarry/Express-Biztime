const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const results = await db.query(`
            SELECT c.code, c.name, c.description, i.industry
            FROM companies AS c
            JOIN company_industries AS ci ON c.code = ci.company_code
            JOIN industries AS i ON ci.industry_code = i.code
            WHERE c.code = $1
        `, [code]);
        if(results.rows.length === 0){
            throw new ExpressError(`Company code: ${code} not found`, 404);
        }
        return res.json({ companies: results.rows[0] })
    } catch (e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try{
        const { code, name, description } = req.body;
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [ code, name, description ]);
        return res.status(201).json({ company: results.rows[0] });
    } catch (e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;
        const { name, description } = req.body;

        // Update the company and return the updated row
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
            [name, description, code]
        );

        if (results.rows.length === 0) {
            // No rows updated means the company code doesn't exist
            throw new ExpressError(`Company code: ${code} not found`, 404);
        }

        return res.json({ company: results.rows[0] }); // Return the updated company
    } catch (e) {
        return next(e); // Pass error to Express error handler
    }
});


router.delete('/:code', async (req, res, next) => {
    try {
        const code = req.params.code;

        // Use RETURNING to confirm deletion
        const results = await db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING code, name, description`,
            [code]
        );

        if (results.rows.length === 0) {
            // No rows were deleted, meaning the company doesn't exist
            throw new ExpressError(`Company with code '${code}' not found`, 404);
        }

        // Return the deleted company details
        return res.json({ msg: "DELETED", company: results.rows[0] });
    } catch (e) {
        return next(e); // Pass errors to the error handler
    }
});



module.exports = router;
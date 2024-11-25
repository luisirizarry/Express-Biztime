const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try{
        const results = await db.query(`SELECT * FROM invoices`);
        return res.json({ invoices: results.rows })
    } catch(e) {
        next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try{
        const id = req.params.id;
        const results = await db.query(`SELECT * FROM invoices WHERE id=$1`, [id]);
        if(results.rows.length === 0){
            throw new ExpressError(`Invoice with id ${id} not found`, 404);
        }
        return res.json({ invoices: results.rows })
    } catch(e) {
        next(e);
    }
});

router.post('/', async (req, res, next) => {
    try{
        const { comp_code, amt } = req.body;

        if (!comp_code || !amt) {
            return res.status(400).json({ error: "comp_code and amt are required" });
        }

        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({ invoices: results.rows[0] })
    } catch(e) {
        next(e);
    }
});

router.put('/:id', async (req, res, next) => {
    try{
        const id = req.params.id;
        const { amt } = req.body;

        if (typeof amt !== 'number' || amt <= 0) {
            return res.status(400).json({ error: "amt must be a positive number" });
        }

        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);

        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }

        return res.json({ invoices: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try{
        const id = req.params.id;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [id]);

        if( results.rows.length === 0){
            throw new ExpressError(`Can't find invoice with id of ${id}`, 404);
        }

        return res.json({ msg: "DELETED", invoices: results.rows[0] });
    } catch(e) {
        next(e);
    }
});


module.exports = router;
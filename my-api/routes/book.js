// routes/book.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../dbConfig'); // Import cấu hình

// Route để lấy danh sách tài khoản
router.get('/book/:maSuat', async (req, res) => {
    const { maSuat } = req.params;

        try {
             let pool = await sql.connect(config);

            const result = await pool.request()
                .input('maSuat', sql.VarChar(20), maSuat)
                .query('SELECT * FROM fSoGheDaDat(@maSuat)');

            res.json(result.recordset);
        } catch (error) {
            console.error('Lỗi khi truy vấn:', error);
            res.status(500).send('Có lỗi xảy ra khi truy vấn cơ sở dữ liệu.');
        }
});

module.exports = router; // Đảm bảo export router

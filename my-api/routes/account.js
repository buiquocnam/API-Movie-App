// routes/account.js
const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../dbConfig'); // Import cấu hình

// Route để lấy danh sách tài khoản
router.get('/', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM KhachHang');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu');
    } finally {
        await sql.close();
    }
});

module.exports = router; // Đảm bảo export router

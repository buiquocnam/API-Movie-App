// routes/movies.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const sql = require('mssql');
const config = require('../dbConfig'); // Import cấu hình

// Route để lấy danh sách phim
router.get('/movies', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Phim');
        res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu');
    } finally {
        await sql.close();
    }
});

// Route để lấy lịch sử khách hàng
router.get('/history/:maKH', async (req, res) => {
    const maKH = req.params.maKH; // Lấy mã khách hàng từ URL
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
        
        .input('maKH', sql.VarChar(20), maKH) // Đặt giá trị cho tham số maKH
        .query('SELECT * FROM fLichSuKH(@maKH)'); // Gọi hàm fLichSuKH

    res.json(result.recordset);
    } catch (err) {
        console.error('Lỗi khi lấy lịch sử:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu lịch sử');
    } finally {
        await sql.close();
    }
});



// Route để lấy những phim đang chiếu
router.get('/movies/phimdangchieu', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        // Lấy danh sách maPhim từ stored procedure GetSuatChieu
        let result = await pool.request().execute('GetSuatChieu');

        // Khởi tạo một mảng để lưu thông tin chi tiết của từng phim
        const movieDetails = [];
        console.log(result.recordset);
        // Lặp qua từng maPhim và gọi API để lấy thông tin chi tiết
        for (const movie of result.recordset) {
            const movieResponse = await axios.get(`http://localhost:3000/api/movies/phim/${movie.maPhim}`); // Gọi API lấy thông tin phim
            movieDetails.push(movieResponse.data); // Thêm thông tin chi tiết vào mảng
        }
        

        // Trả về danh sách thông tin chi tiết của các phim
        res.json(movieDetails);
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu phim đang chiếu:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu phim đang chiếu');
    } finally {
        await sql.close();
    }
});

// Route để lấy những phim chưa chiếu
router.get('/movies/phimchuachieu', async (req, res) => {
    try {
        let pool = await sql.connect(config);

        // Lấy danh sách maPhim từ stored procedure GetSuatChieu
        let result = await pool.request().execute('GetSuatChuaChieu');

        // Khởi tạo một mảng để lưu thông tin chi tiết của từng phim
        const movieDetails = [];
        console.log(result.recordset);
        // Lặp qua từng maPhim và gọi API để lấy thông tin chi tiết
        for (const movie of result.recordset) {
            const movieResponse = await axios.get(`http://localhost:3000/api/movies/phim/${movie.maPhim}`); // Gọi API lấy thông tin phim
            movieDetails.push(movieResponse.data); // Thêm thông tin chi tiết vào mảng
        }
        
        // Trả về danh sách thông tin chi tiết của các phim
        res.json(movieDetails);
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu phim đang chiếu:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu phim đang chiếu');
    } finally {
        await sql.close();
    }
});

// Route để lấy thông tin của phim thông qua maPhim
router.get('/movies/phim/:maPhim', async (req, res) => {
    const { maPhim } = req.params; // Lấy mã phim từ URL
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('maPhim', sql.NVarChar, maPhim)
            .query('SELECT [maPhim], [tenPhim], [daoDien], [doTuoiYeuCau], [ngayKhoiChieu], [thoiLuong], [tinhTrang], [hinhDaiDien], [video], [moTa] FROM Phim WHERE maPhim = @maPhim');

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // Trả về thông tin chi tiết của phim
        } else {
            res.status(404).send('Phim không tìm thấy');
        }
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu phim:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu phim');
    } finally {
        await sql.close();
    }
});

// Route để lấy ngay chieu cua phim
router.get('/movies/ngaychieu/:maPhim', async (req, res) => {
    const maPhim = req.params.maPhim; // Lấy maPhim từ URL

    try {
        // Kết nối SQL
        let pool = await sql.connect(config);

        // Gọi hàm fXuatNgayChieu với tham số maPhim
        let result = await pool.request()
            .input('id', sql.NVarChar(50), maPhim) // Truyền maPhim vào hàm fXuatNgayChieu
            .query('SELECT * FROM fXuatNgayChieu(@id)'); // Gọi hàm SQL

        const ngayChieuList = result.recordset.map(item => {
            return {
                ngayChieu: item.ngayChieu.toISOString().split('T')[0] // Chỉ lấy ngày tháng năm
            };
        });
        // Trả về dữ liệu dạng JSON
        res.json(ngayChieuList);
    } catch (err) {
        console.error('Lỗi khi lấy dữ liệu ngày chiếu:', err);
        res.status(500).send('Lỗi khi lấy dữ liệu ngày chiếu');
    } finally {
        // Đóng kết nối SQL
        await sql.close();
    }

});

    router.get('/get-schedule/:id', async (req, res) => {
        const phimId = req.params.id;
        try {

            let pool = await sql.connect(config)
            // Truy vấn để lấy ngày chiếu
            let result = await pool.request()
            .input('id', sql.NVarChar(50), phimId) // Truyền phimId vào hàm fXuatNgayChieu
            .query('SELECT * FROM fXuatNgayChieu1(@id)'); // Gọi hàm SQL

        console.log("result recordst" + result.recordset); // Ghi log kết quả nhận được

        const ngayChieuList = result.recordset.map(item => {
            return {
                maSuat: item.maSuat,
                ngayChieu: item.ngayChieu.toISOString().split('T')[0] // Chỉ lấy ngày tháng năm
            };
        });
        console.log(ngayChieuList);
        // Tạo mảng kết quả
        const schedules = [];

        // Lặp qua từng ngày chiếu để lấy thời gian chiếu
        for (const { ngayChieu, maSuat } of ngayChieuList) { // Không cần truyền maSuat
            const resultThoiGianChieu = await pool.request()
                .input('id', sql.NVarChar, phimId)
                .input('ngayChieu', sql.Date, ngayChieu)
                .input('maSuat', sql.NVarChar(50), maSuat) // Truyền maSuat
                .query(`
                    SELECT DISTINCT thoiGianBatDau, maCa, maSuat
                    FROM dbo.fXuatThoiGianChieu1(@id, @ngayChieu)
                `);
                
            schedules.push({
                ngayChieu: ngayChieu,
                caChieu: resultThoiGianChieu.recordset.map(thoiGian => {
                    return {
                        thoiGianBatDau: thoiGian.thoiGianBatDau.toISOString().split('T')[1].split('.')[0],
                        maCa: thoiGian.maCa,
                        maSuat: thoiGian.maSuat
                    };
                })
            });
            break;
        }
        console.log("ket qua cuoi cung: ");
        console.log(schedules);

            // Trả về kết quả JSON
            res.json(schedules);
        } catch (error) {
            console.error('Lỗi khi truy vấn:', error);
            res.status(500).send('Đã xảy ra lỗi.');
        }
    });






module.exports = router;

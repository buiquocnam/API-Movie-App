// dbConfig.js
const os = require('os');

// Hàm lấy địa chỉ IP của máy chủ
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Bỏ qua các địa chỉ loopback, địa chỉ IPv6, và không phải nội bộ
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost'; // Mặc định nếu không tìm thấy IP
}


const config = {
    user: 'sa', // Tên người dùng
    password: '123456', // Mật khẩu
    server:  getLocalIp(), // Địa chỉ máy chủ
    database: 'Cinema', // Tên cơ sở dữ liệu
    options: {
        encrypt: true, // Nếu sử dụng Azure, để true
        trustServerCertificate: true // Chỉ để phát triển
    }
};

module.exports = config;

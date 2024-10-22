const express = require('express');
const app = express();
const port = 3000;

// Middleware để parse JSON
app.use(express.json());

// Import route
const moviesRoute = require('./routes/movies');
const accountRoute = require('./routes/account');
const bookRoute = require('./routes/book')
const movieTicketRoute = require('./routes/move_ticket')
const emailRoute = require('./routes/email')
// Sử dụng route
// app.use('/api/movies', moviesRoute);
app.use('/api', moviesRoute);
app.use('/api', bookRoute);
app.use('/api', movieTicketRoute);
app.use('/api', emailRoute)

app.use('/api/accounts', accountRoute);

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});

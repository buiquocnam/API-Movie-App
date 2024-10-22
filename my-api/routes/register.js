// routes/register.js
const express = require('express');
const axios = require('axios');
const router = express.Router();
const sql = require('mssql');
const config = require('../dbConfig'); // Import cấu hình

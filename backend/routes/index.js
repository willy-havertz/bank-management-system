const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const transactionRoutes = require('./transactionRoutes');
const loanRoutes = require('./loanRoutes');
const notificationRoutes = require('./notificationRoutes');
const uploadRoutes = require('./uploadRoutes');
const userRoutes = require('./userRoutes');
const contactRoutes = require('./contactRoutes');
const customerRoutes = require('./customerRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const dashboardDataRoutes = require('./dashboardDataRoutes');

router.use('/auth', authRoutes);
router.use('/contact', contactRoutes);
router.use('/transaction', transactionRoutes);
router.use('/loan', loanRoutes);
router.use('/notification', notificationRoutes);
router.use('/user', userRoutes);
router.use('/customer', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/dashboard-data', dashboardDataRoutes);
router.use('/user', uploadRoutes); // For profile picture upload

module.exports = router;

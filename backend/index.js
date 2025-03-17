const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const accountRoutes = require('./routes/account.routes');
const authRoutes = require('./routes/auth.routes');
const depositRoutes = require('./routes/deposit.routes');
const transactionRoutes = require('./routes/transaction.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const loanRoutes = require('./routes/loan.routes');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/account', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/withdrawal', withdrawalRoutes);
app.use('/api/loan', loanRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
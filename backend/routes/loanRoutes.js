const express = require('express');
const router = express.Router();
const { applyLoan, getLoans, getAllPendingLoans, approveLoan,rejectLoan } = require('../controllers/loanController');
const { authenticateToken } = require('../middleware/jwt');

// Log every request to this router with timestamp, method, and URL
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// POST /loan - Apply for a loan (requires authentication)
router.post('/', authenticateToken, (req, res, next) => {
  console.log("Route POST /loan called");
  // Call the controller function and catch any unhandled errors
  Promise.resolve(applyLoan(req, res)).catch(next);
});

// GET /loans - Retrieve user's loans (requires authentication)
router.get('/loans', authenticateToken, (req, res, next) => {
  console.log("Route GET /loans called");
  Promise.resolve(getLoans(req, res)).catch(next);
});

// GET /pending-loans - Retrieve all pending loans (for employee dashboard, requires authentication)
router.get('/pending-loans', authenticateToken, (req, res, next) => {
  console.log("Route GET /pending-loans called");
  Promise.resolve(getAllPendingLoans(req, res)).catch(next);
});

// POST /approve - Approve a loan (requires authentication)
router.post('/approve', authenticateToken, (req, res, next) => {
  console.log("Route POST /approve called");
  Promise.resolve(approveLoan(req, res)).catch(next);
});

router.post('/reject', authenticateToken, (req, res, next) => {
  console.log("Route POST /reject called");
  Promise.resolve(rejectLoan(req, res)).catch(next);
});




module.exports = router;

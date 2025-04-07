
CREATE TYPE user_role AS ENUM ('customer', 'employee');
CREATE TYPE transaction_type AS ENUM ('Deposit', 'Withdrawal', 'Send', 'Receive');

-- Users table
CREATE TABLE users (
  id bigint primary key generated always as identity,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password text NOT NULL,
  phone text,
  idNumber text,
  role user_role DEFAULT 'customer',
  balance DECIMAL(10,2) DEFAULT 0,
  profile_picture text,
  investments DECIMAL(10,2) DEFAULT 0,
  creditUtilized DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id bigint primary key generated always as identity,
  userId bigint NOT NULL,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Loans table
CREATE TABLE loans (
  id bigint primary key generated always as identity,
  userId bigint NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purpose text NOT NULL,
  status text DEFAULT 'Pending',
  date TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Notifications table
CREATE TABLE notifications (
  id bigint primary key generated always as identity,
  userId bigint NOT NULL,
  message text,
  date TIMESTAMP with time zone DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- 3. Create Functions (Procedures)

-- Function: Deposit Funds
CREATE OR REPLACE FUNCTION depositFunds(p_userId bigint, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET balance = balance + p_amount WHERE id = p_userId;
  INSERT INTO transactions (userId, type, amount)
    VALUES (p_userId, 'Deposit', p_amount);
  INSERT INTO notifications (userId, message)
    VALUES (p_userId, 'You have deposited Ksh ' || p_amount || '.');
END;
$$ LANGUAGE plpgsql;

-- Function: Withdraw Funds
CREATE OR REPLACE FUNCTION withdrawFunds(p_userId bigint, p_amount DECIMAL)
RETURNS VOID AS $$
DECLARE
  currentBalance DECIMAL;
BEGIN
  SELECT balance INTO currentBalance FROM users WHERE id = p_userId;
  IF currentBalance >= p_amount THEN
    UPDATE users SET balance = balance - p_amount WHERE id = p_userId;
    INSERT INTO transactions (userId, type, amount)
      VALUES (p_userId, 'Withdrawal', p_amount);
    INSERT INTO notifications (userId, message)
      VALUES (p_userId, 'You have withdrawn Ksh ' || p_amount || '.');
  ELSE
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Apply for Loan
CREATE OR REPLACE FUNCTION applyForLoan(p_userId bigint, p_amount DECIMAL, p_purpose text)
RETURNS VOID AS $$
BEGIN
  INSERT INTO loans (userId, amount, purpose, status)
    VALUES (p_userId, p_amount, p_purpose, 'Pending');
  INSERT INTO notifications (userId, message)
    VALUES (p_userId, 'Loan application for Ksh ' || p_amount || ' submitted.');
END;
$$ LANGUAGE plpgsql;

-- Function: Send Money Between Accounts
CREATE OR REPLACE FUNCTION sendMoney(p_senderId bigint, p_recipientEmail text, p_amount DECIMAL)
RETURNS VOID AS $$
DECLARE
  senderBalance DECIMAL;
  recipientId bigint;
BEGIN
  SELECT balance INTO senderBalance FROM users WHERE id = p_senderId;
  IF senderBalance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  SELECT id INTO recipientId FROM users WHERE email = p_recipientEmail LIMIT 1;
  IF recipientId IS NULL THEN
    RAISE EXCEPTION 'Recipient not found';
  END IF;
  
  UPDATE users SET balance = balance - p_amount WHERE id = p_senderId;
  UPDATE users SET balance = balance + p_amount WHERE id = recipientId;
  
  INSERT INTO transactions (userId, type, amount)
    VALUES (p_senderId, 'Send', p_amount);
  INSERT INTO transactions (userId, type, amount)
    VALUES (recipientId, 'Receive', p_amount);
  
  INSERT INTO notifications (userId, message)
    VALUES (p_senderId, 'You sent Ksh ' || p_amount || ' to ' || p_recipientEmail);
  INSERT INTO notifications (userId, message)
    VALUES (recipientId, 'You received Ksh ' || p_amount || ' from an account');
END;
$$ LANGUAGE plpgsql;

-- Function: Update User Details
CREATE OR REPLACE FUNCTION updateUserDetails(p_userId bigint, p_name text, p_phone text, p_idNumber text)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET name = p_name, phone = p_phone, idNumber = p_idNumber WHERE id = p_userId;
  INSERT INTO notifications (userId, message)
    VALUES (p_userId, 'Your profile details have been updated.');
END;
$$ LANGUAGE plpgsql;

-- Employee-Specific Functions

-- Function: Approve Loan
CREATE OR REPLACE FUNCTION approveLoanProc(p_loanId bigint)
RETURNS VOID AS $$
DECLARE
  userId bigint;
BEGIN
  UPDATE loans SET status = 'Approved' WHERE id = p_loanId;
  SELECT userId INTO userId FROM loans WHERE id = p_loanId;
  INSERT INTO notifications (userId, message)
    VALUES (userId, 'Your loan (ID: ' || p_loanId || ') has been approved.');
END;
$$ LANGUAGE plpgsql;

-- Function: Reject Loan
CREATE OR REPLACE FUNCTION rejectLoanProc(p_loanId bigint)
RETURNS VOID AS $$
DECLARE
  userId bigint;
BEGIN
  UPDATE loans SET status = 'Rejected' WHERE id = p_loanId;
  SELECT userId INTO userId FROM loans WHERE id = p_loanId;
  INSERT INTO notifications (userId, message)
    VALUES (userId, 'Your loan (ID: ' || p_loanId || ') has been rejected.');
END;
$$ LANGUAGE plpgsql;

-- Function: Generate Monthly Report
CREATE OR REPLACE FUNCTION generateMonthlyReport(p_month INT, p_year INT)
RETURNS TABLE(
  totalTransactions INT,
  totalDeposits DECIMAL,
  totalWithdrawals DECIMAL,
  totalAmount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS totalTransactions,
    COALESCE(SUM(CASE WHEN type = 'Deposit' THEN amount ELSE 0 END), 0) AS totalDeposits,
    COALESCE(SUM(CASE WHEN type = 'Withdrawal' THEN amount ELSE 0 END), 0) AS totalWithdrawals,
    COALESCE(SUM(amount), 0) AS totalAmount
  FROM transactions
  WHERE EXTRACT(MONTH FROM date) = p_month AND EXTRACT(YEAR FROM date) = p_year;
END;
$$ LANGUAGE plpgsql;

-- Function: Get All Customers
CREATE OR REPLACE FUNCTION getAllCustomers()
RETURNS TABLE(
  id bigint,
  name text,
  email text,
  phone text,
  idNumber text,
  balance DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, name, email, phone, idNumber, balance
  FROM users
  WHERE role = 'customer';
END;
$$ LANGUAGE plpgsql;

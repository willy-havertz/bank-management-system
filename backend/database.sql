CREATE DATABASE banking_system;
USE banking_system;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  idNumber VARCHAR(50),
  role ENUM('customer', 'employee') DEFAULT 'customer',
  balance DECIMAL(10,2) DEFAULT 0,
  profile_picture VARCHAR(255),
  investments DECIMAL(10,2) DEFAULT 0,
  creditUtilized DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('Deposit', 'Withdrawal', 'Send', 'Receive') NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE loans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  message VARCHAR(255),
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

DELIMITER $$

-- Procedure for depositing funds
CREATE PROCEDURE depositFunds(
  IN p_userId INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  UPDATE users SET balance = balance + p_amount WHERE id = p_userId;
  INSERT INTO transactions (userId, type, amount) VALUES (p_userId, 'Deposit', p_amount);
  INSERT INTO notifications (userId, message) 
    VALUES (p_userId, CONCAT('You have deposited Ksh ', p_amount, '.'));
END$$

-- Procedure for withdrawing funds
CREATE PROCEDURE withdrawFunds(
  IN p_userId INT,
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE currentBalance DECIMAL(10,2);
  SELECT balance INTO currentBalance FROM users WHERE id = p_userId;
  IF currentBalance >= p_amount THEN
    UPDATE users SET balance = balance - p_amount WHERE id = p_userId;
    INSERT INTO transactions (userId, type, amount) VALUES (p_userId, 'Withdrawal', p_amount);
    INSERT INTO notifications (userId, message) 
      VALUES (p_userId, CONCAT('You have withdrawn Ksh ', p_amount, '.'));
  ELSE
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
  END IF;
END$$

-- Procedure for applying for a loan
CREATE PROCEDURE applyForLoan(
  IN p_userId INT,
  IN p_amount DECIMAL(10,2),
  IN p_purpose VARCHAR(255)
)
BEGIN
  INSERT INTO loans (userId, amount, purpose, status) VALUES (p_userId, p_amount, p_purpose, 'Pending');
  INSERT INTO notifications (userId, message) 
    VALUES (p_userId, CONCAT('Loan application for Ksh ', p_amount, ' submitted.'));
END$$

-- Procedure for sending money between accounts
CREATE PROCEDURE sendMoney(
  IN p_senderId INT,
  IN p_recipientEmail VARCHAR(100),
  IN p_amount DECIMAL(10,2)
)
BEGIN
  DECLARE senderBalance DECIMAL(10,2);
  DECLARE recipientId INT;
  
  SELECT balance INTO senderBalance FROM users WHERE id = p_senderId;
  IF senderBalance < p_amount THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient balance';
  END IF;
  
  SELECT id INTO recipientId FROM users WHERE email = p_recipientEmail LIMIT 1;
  IF recipientId IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Recipient not found';
  END IF;
  
  UPDATE users SET balance = balance - p_amount WHERE id = p_senderId;
  UPDATE users SET balance = balance + p_amount WHERE id = recipientId;
  
  INSERT INTO transactions (userId, type, amount) VALUES (p_senderId, 'Send', p_amount);
  INSERT INTO transactions (userId, type, amount) VALUES (recipientId, 'Receive', p_amount);
  
  INSERT INTO notifications (userId, message)
    VALUES (p_senderId, CONCAT('You sent Ksh ', p_amount, ' to ', p_recipientEmail));
  INSERT INTO notifications (userId, message)
    VALUES (recipientId, CONCAT('You received Ksh ', p_amount, ' from an account'));
END$$

-- Procedure for updating user details
CREATE PROCEDURE updateUserDetails(
  IN p_userId INT,
  IN p_name VARCHAR(100),
  IN p_phone VARCHAR(20),
  IN p_idNumber VARCHAR(50)
)
BEGIN
  UPDATE users SET name = p_name, phone = p_phone, idNumber = p_idNumber WHERE id = p_userId;
  INSERT INTO notifications (userId, message)
    VALUES (p_userId, 'Your profile details have been updated.');
END$$

-- Employee-specific Procedures

-- Procedure for an employee to approve a loan
CREATE PROCEDURE approveLoanProc(
  IN p_loanId INT
)
BEGIN
  DECLARE userId INT;
  UPDATE loans SET status = 'Approved' WHERE id = p_loanId;
  SELECT userId INTO userId FROM loans WHERE id = p_loanId;
  INSERT INTO notifications (userId, message)
    VALUES (userId, CONCAT('Your loan (ID: ', p_loanId, ') has been approved.'));
END$$

-- Procedure for an employee to reject a loan
CREATE PROCEDURE rejectLoanProc(
  IN p_loanId INT
)
BEGIN
  DECLARE userId INT;
  UPDATE loans SET status = 'Rejected' WHERE id = p_loanId;
  SELECT userId INTO userId FROM loans WHERE id = p_loanId;
  INSERT INTO notifications (userId, message)
    VALUES (userId, CONCAT('Your loan (ID: ', p_loanId, ') has been rejected.'));
END$$

-- Procedure for generating a monthly report (example: transactions summary)
CREATE PROCEDURE generateMonthlyReport(
  IN p_month INT,
  IN p_year INT
)
BEGIN
  SELECT 
    COUNT(*) AS totalTransactions,
    SUM(CASE WHEN type = 'Deposit' THEN amount ELSE 0 END) AS totalDeposits,
    SUM(CASE WHEN type = 'Withdrawal' THEN amount ELSE 0 END) AS totalWithdrawals,
    SUM(amount) AS totalAmount
  FROM transactions
  WHERE MONTH(date) = p_month AND YEAR(date) = p_year;
END$$

-- Procedure to fetch all customers (for employee operations)
CREATE PROCEDURE getAllCustomers()
BEGIN
  SELECT id, name, email, phone, idNumber, balance FROM users WHERE role = 'customer';
END$$

DELIMITER ;

CREATE DATABASE banking_system;
USE banking_system;

-- Create table for customer information
CREATE TABLE Customer (
    CustomerID INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create table for account details
CREATE TABLE Account (
    AccountID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    accountType ENUM('Savings', 'Checking') DEFAULT 'Savings',

    Balance DECIMAL(15,2) DEFAULT 0.00,
    Status ENUM('Active', 'Inactive', 'Frozen') DEFAULT 'Active',
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);

-- Create table for transactions
CREATE TABLE Transaction (
    TransactionID INT PRIMARY KEY AUTO_INCREMENT,
    AccountID INT,
    TransactionType ENUM('Deposit', 'Withdrawal', 'Transfer') NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (AccountID) REFERENCES Account(AccountID)
);

-- Create table for loan details
CREATE TABLE loans (
    loan_id INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    AccountI INT,
    Amount DECIMAL(13,2) NOT NULL,
    InterestRate DECIMAL(5,2) NOT NULL,
    TermMonths INT NOT NULL,
    Status ENUM('Pending', 'Approved', 'Rejected', 'Paid') DEFAULT 'Pending',
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID),
    FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID)
);

-- Create table for loan payments
CREATE TABLE LoanPayments (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    LoanID INT,
    PaymentAmount DECIMAL(15,2) NOT NULL,
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (LoanID) REFERENCES Loans(LoanID)
);

-- Create table for account queries/support tickets
CREATE TABLE account_queries (
    QueryID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerID INT,
    Subject VARCHAR(200) NOT NULL,
    Description TEXT NOT NULL,
    Status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    DateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ResolvedAt TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);
CREATE TABLE Newb (
    NewbID INT NOT NULL AUTO_INCREMENT,
    primary key(NewbID)
);


-- Sample data for customers
INSERT INTO customersTABLE (first_name, last_name, email, phone_number) VALUES
(' ', ' ', ' ', ' ', '  '),
('  ', '  ', '  ', '    ', '    '),
('   ', '   ', '     ', '      ', '     ');

-- Sample data for accounts
INSERT INTO accounts (customer_id, account_type, balance) VALUES
(1, 'Savings', 5000.00, 'Active'),
(1, 'Checking', 2500.00, 'Active'),
(2, 'Savings', 10000.00, 'Active'),
(3, 'Checking', 3500.00, 'Active');

-- Sample data for transactions
INSERT INTO transactions (account_id, transaction_type, amount, description) VALUES
(1, 'Deposit', 1000.00, 'Initial deposit'),
(2, 'Withdrawal', 500.00, 'ATM withdrawal'),
(3, 'Transfer', 1500.00, 'Transfer to checking'),
(4, 'Deposit', 2000.00, 'Salary deposit');

-- Sample data for loans
INSERT INTO loans (customer_id, account_id, loan_amount, interest_rate, term_months, status) VALUES
(1, 1, 10000.00, 5.50, 24, 'Approved'),
(2, 3, 25000.00, 6.25, 36, 'Pending'),
(3, 4, 15000.00, 5.75, 24, 'Approved');

-- Sample data for loan payments
INSERT INTO loan_payments (loan_id, payment_amount) VALUES
(1, 450.00),
(1, 450.00),
(3, 675.00);

-- Sample data for account queries
INSERT INTO account_queries (customer_id, subject, description, status) VALUES
(1, 'Card Issue', 'Unable to use debit card at ATM', 'Open'),
(2, 'Online Banking', 'Reset password request', 'Resolved'),
(3, 'Loan Inquiry', 'Information about personal loans', 'In Progress');

-- 1. Select all customers with their basic information
SELECT 
    customer_id,
    CONCAT(first_name, ' ', last_name) as full_name,
    email,
    phone_number,
    CONCAT(city, ', ', state) as location,
    date_of_birth
FROM customers;

-- 2. Select all accounts with customer information
SELECT 
    a.account_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    a.account_type,
    a.balance,
    a.status,
    a.created_at
FROM accounts a
JOIN customers c ON a.customer_id = c.customer_id;

-- 3. Select all transactions with account and customer details
SELECT 
    t.transaction_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    a.account_type,
      t.transaction_type,
      t.amount,
      t.description,
      t.transaction_date
FROM transactions t
JOIN accounts a ON t.account_id = a.account_id
JOIN customers c ON a.customer_id = c.customer_id;

-- 4. Select all loans with customer details
SELECT 
    l.loan_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    l.loan_amount,
    l.interest_rate,
    l.term_months,
    l.status,
    l.application_date
FROM loans l
JOIN customers c ON l.customer_id = c.customer_id;

-- 5. Select all loan payments with loan and customer details
SELECT 
    lp.payment_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    l.loan_amount,
    lp.payment_amount,
    lp.payment_date
FROM loan_payments lp
JOIN loans l ON lp.loan_id = l.loan_id
JOIN customers c ON l.customer_id = c.customer_id;
SELECT 
    aq.query_id,
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    aq.subject,
    aq.description,
    aq.status,
    aq.created_at,
    aq.resolved_at
FROM account_queries aq
JOIN customers c ON aq.customer_id = c.customer_id;

-- Additional useful queries

-- Get account balance summary by customer
SELECT 
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    COUNT(a.account_id) as number_of_accounts,
    SUM(a.balance) as total_balance
FROM customers c
LEFT JOIN accounts a ON c.customer_id = a.customer_id
GROUP BY c.customer_id;

-- Get loan summary by customer
SELECT 
    CONCAT(c.first_name, ' ', c.last_name) as customer_name,
    COUNT(l.loan_id) as number_of_loans,
    SUM(l.loan_amount) as total_loan_amount,
    AVG(l.interest_rate) as average_interest_rate
FROM customers c
LEFT JOIN loans l ON c.customer_id = l.customer_id
GROUP BY c.customer_id;

-- Check existing indexes on customers table
SHOW INDEX FROM customers;

-- Drop the existing index if it exists
DROP INDEX idq_customer_email ON customers;

-- Create the index again
CREATE INDEX idq_customer_email ON customers(email);

SHOW INDEX FROM accounts;
DROP INDEX idy_account_customer ON accounts;
CREATE INDEX idy_account_customer ON accounts(customer_id);

SHOW INDEX FROM transactions;
DROP INDEX idz_transaction_account ON transactions;
CREATE INDEX idz_transaction_account ON transactions(account_id);

SHOW INDEX FROM loans;
DROP INDEX idm_loan_customer ON loans;
CREATE INDEX idm_loans_customer ON loans(customer_id);

SHOW INDEX FROM account_queries;
DROP INDEX idn_account_queries_customer ON account_queries;
CREATE INDEX idn_account_queries_customer ON account_queries(customer_id);

-- Example of SQL with syntax errors

-- Missing columns in SELECT
SELECT FROM users;

-- Invalid WHERE clause
SELECT id, name 
FROM users 
WHERE;

-- Incomplete JOIN
SELECT u.id, o.total
FROM users u
JOIN orders o
WHERE u.active = 1;

-- Missing values in INSERT
INSERT INTO users (name, email) VALUES;
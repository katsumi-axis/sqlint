-- Example of well-formatted SQL that passes all linting rules

SELECT 
    u.id,
    u.username,
    u.email,
    u.created_at,
    COUNT(o.id) AS order_count,
    SUM(o.total_amount) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = 1
    AND u.created_at >= '2023-01-01'
GROUP BY u.id, u.username, u.email, u.created_at
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 10;

-- INSERT example
INSERT INTO users (username, email, active)
VALUES ('john_doe', 'john@example.com', 1);

-- UPDATE example
UPDATE users
SET last_login = NOW()
WHERE id = 123;

-- DELETE example
DELETE FROM sessions
WHERE expires_at < NOW();
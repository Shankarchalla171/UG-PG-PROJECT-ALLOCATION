-- Only create user if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_activity_points;

-- Create a new user (not root)
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY 'Pratheek@1234';
GRANT ALL PRIVILEGES ON seLabDatabase.* TO 'selabuser'@'%';
FLUSH PRIVILEGES;

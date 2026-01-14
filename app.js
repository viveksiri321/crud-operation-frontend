// connect  with mysql database and perform CRUD operations
// run this file as node app.js
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',           // Replace with your MySQL username
  password: '12345', // Replace with your MySQL password
  database: 'studentDB'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create students table if it doesn't exist
const createTableQuery = `
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  degree VARCHAR(255) NOT NULL,
  city VARCHAR(255) NOT NULL
)
`;

db.query(createTableQuery, (err, result) => {
  if (err) throw err;
  console.log('Students table ready');
});

// Serve index.html on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index1.html'));
});

// ===== API Routes ===== //

// Get all students
app.get('/students', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add a student
app.post('/students', (req, res) => {
  const { roll, name, degree, city } = req.body;
  const query = 'INSERT INTO students (roll, name, degree, city) VALUES (?, ?, ?, ?)';
  db.query(query, [roll, name, degree, city], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student added', id: result.insertId });
  });
});

// Update a student
app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { roll, name, degree, city } = req.body;
  const query = 'UPDATE students SET roll=?, name=?, degree=?, city=? WHERE id=?';
  db.query(query, [roll, name, degree, city, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student updated' });
  });
});

// Delete a student
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM students WHERE id=?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Student deleted' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

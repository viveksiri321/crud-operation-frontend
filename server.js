// connect  with mongodb database and perform CRUD operations
// run this file as node server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/studentDB')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Student Schema & Model
const studentSchema = new mongoose.Schema({
  roll: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  degree: { type: String, required: true },
  city: { type: String, required: true }
});

const Student = mongoose.model('Student', studentSchema);

// -------- Serve HTML --------
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Student Registration</title>
      <link rel="stylesheet" href="/style.css">
    </head>
    <body>
      <div class="container">
        <h2>Student Registration Form</h2>
        <form id="studentForm">
          <input type="number" id="roll" placeholder="Roll No:" required>
          <input type="text" id="name" placeholder="Name:" required>
          <input type="text" id="degree" placeholder="Degree:" required>
          <input type="text" id="city" placeholder="City:" required>
          <button type="submit" id="saveBtn">Save</button>
        </form>

        <h2>Student Table</h2>
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Degree</th>
              <th>City</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="studentTableBody"></tbody>
        </table>
      </div>

      <script src="/script.js"></script>
    </body>
    </html>
  `);
});

// -------- Serve CSS --------
app.get('/style.css', (req, res) => {
  res.type('text/css');
  res.send(`
    body { font-family: Arial; padding: 20px; background: #f5f5f5; }
    .container { max-width: 800px; margin:auto; background:#fff; padding:20px; border-radius:10px; box-shadow:0 0 10px rgba(0,0,0,0.1);}
    h2 { text-align:center; }
    input { display:block; width:100%; padding:10px; margin:10px 0; border:1px solid #ccc; border-radius:5px; }
    button { padding:10px; border:none; border-radius:5px; cursor:pointer; }
    #saveBtn { background:green; color:white; width:100%; font-size:16px; }
    table { width:100%; margin-top:20px; border-collapse:collapse; }
    th, td { padding:12px; text-align:left; border-bottom:1px solid #ddd; }
    button.edit { background:orange; color:white; margin-right:5px; }
    button.delete { background:crimson; color:white; }
  `);
});

// -------- Serve JS --------
app.get('/script.js', (req, res) => {
  res.type('text/javascript');
  res.send(`
    const form = document.getElementById('studentForm');
    const tableBody = document.getElementById('studentTableBody');
    let editingId = null;

    async function fetchStudents() {
      const res = await fetch('/students');
      const students = await res.json();
      tableBody.innerHTML = '';
      students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = \`
          <td>\${student.roll}</td>
          <td>\${student.name}</td>
          <td>\${student.degree}</td>
          <td>\${student.city}</td>
          <td>
            <button class="edit" onclick='editStudent("\${student._id}")'>Edit</button>
            <button class="delete" onclick='deleteStudent("\${student._id}")'>Delete</button>
          </td>
        \`;
        tableBody.appendChild(row);
      });
    }

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      const roll = document.getElementById('roll').value;
      const name = document.getElementById('name').value;
      const degree = document.getElementById('degree').value;
      const city = document.getElementById('city').value;
      const studentData = { roll, name, degree, city };

      if (!editingId) {
        await fetch('/students', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(studentData) });
      } else {
        await fetch('/students/' + editingId, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(studentData) });
        editingId = null;
      }
      form.reset();
      fetchStudents();
    });

    async function editStudent(id) {
      const res = await fetch('/students');
      const students = await res.json();
      const student = students.find(s => s._id === id);
      document.getElementById('roll').value = student.roll;
      document.getElementById('name').value = student.name;
      document.getElementById('degree').value = student.degree;
      document.getElementById('city').value = student.city;
      editingId = id;
    }

    async function deleteStudent(id) {
      if(confirm("Are you sure you want to delete this student?")) {
        await fetch('/students/' + id, { method:'DELETE' });
        fetchStudents();
      }
    }

    fetchStudents();
  `);
});

// -------- API Routes --------

// Get all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add student
app.post('/students', async (req, res) => {
  const { roll, name, degree, city } = req.body;
  const student = new Student({ roll, name, degree, city });
  try {
    const savedStudent = await student.save();
    res.status(201).json(savedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update student
app.put('/students/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete student
app.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// -------- Start Server --------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

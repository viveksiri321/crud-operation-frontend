// connect  with mongodb database and perform CRUD operations
const form = document.getElementById('studentForm');
const tableBody = document.getElementById('studentTableBody');

let editingId = null;

async function fetchStudents() {
  const res = await fetch('http://localhost:3000/students');
  const students = await res.json();
  tableBody.innerHTML = '';
  students.forEach(student => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>${student.degree}</td>
      <td>${student.city}</td>
      <td>
        <button class="edit" onclick='editStudent("${student._id}")'>Edit</button>
        <button class="delete" onclick='deleteStudent("${student._id}")'>Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

form.addEventListener('submit', async function (e) {
  e.preventDefault();
  const roll = document.getElementById('roll').value;
  const name = document.getElementById('name').value;
  const degree = document.getElementById('degree').value;
  const city = document.getElementById('city').value;

  const studentData = { roll, name, degree, city };

  if (!editingId) {
    await fetch('http://localhost:3000/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
  } else {
    await fetch(`http://localhost:3000/students/${editingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    editingId = null;
  }

  form.reset();
  fetchStudents();
});

async function editStudent(id) {
  const res = await fetch(`http://localhost:3000/students`);
  const students = await res.json();
  const student = students.find(s => s._id === id);
  document.getElementById('roll').value = student.roll;
  document.getElementById('name').value = student.name;
  document.getElementById('degree').value = student.degree;
  document.getElementById('city').value = student.city;
  editingId = id;
}

async function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student?")) {
    await fetch(`http://localhost:3000/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  }
}

// Initial load
fetchStudents();

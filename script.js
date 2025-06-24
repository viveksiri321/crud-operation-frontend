const form = document.getElementById('studentForm');
const tableBody = document.getElementById('studentTableBody');

let students = [];
let editingIndex = null;

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const roll = document.getElementById('roll').value;
  const name = document.getElementById('name').value;
  const degree = document.getElementById('degree').value;
  const city = document.getElementById('city').value;

  const studentData = { roll, name, degree, city };

  if (editingIndex === null) {
    students.push(studentData);
  } else {
    students[editingIndex] = studentData;
    editingIndex = null;
  }

  form.reset();
  displayStudents();
});

function displayStudents() {
  tableBody.innerHTML = '';
  students.forEach((student, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.roll}</td>
      <td>${student.name}</td>
      <td>${student.degree}</td>
      <td>${student.city}</td>
      <td>
        <button class="edit" onclick="editStudent(${index})">Edit</button>
        <button class="delete" onclick="deleteStudent(${index})">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function editStudent(index) {
  const student = students[index];
  document.getElementById('roll').value = student.roll;
  document.getElementById('name').value = student.name;
  document.getElementById('degree').value = student.degree;
  document.getElementById('city').value = student.city;
  editingIndex = index;
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    displayStudents();
  }
}

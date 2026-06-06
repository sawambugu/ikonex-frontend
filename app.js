const API_URL = 'https://ikonex-backend.onrender.com/api';


document.getElementById('streamForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/streams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('streamName').value }) });
    alert('Stream Created!'); e.target.reset();
});
document.getElementById('subjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/subjects`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: document.getElementById('subjectName').value }) });
    alert('Subject Created!'); e.target.reset();
});
document.getElementById('studentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/students`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: document.getElementById('firstName').value, last_name: document.getElementById('lastName').value, stream_id: document.getElementById('streamId').value })
    });
    alert('Student Registered!'); e.target.reset(); fetchStudents();
});
document.getElementById('scoreForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/scores`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: document.getElementById('studentId').value, subject_id: document.getElementById('subjectId').value, marks: document.getElementById('marks').value })
    });
    if(res.ok) alert('Score Submitted!'); else alert('Failed or Duplicate Score');
    e.target.reset();
});
async function generateReportCard() {
    const id = document.getElementById('reportStudentId').value;
    const res = await fetch(`${API_URL}/reports/students/${id}`);
    const data = await res.json();
    if(data.message) return alert(data.message);
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.text(`Ikonex Academy - Report Card`, 20, 20);
    doc.text(`Name: ${data.student} | Total: ${data.total} | Avg: ${data.average}% | Grade: ${data.grade}`, 20, 40);
    let y = 60; data.scores.forEach(s => { doc.text(`${s.subject}: ${s.marks}`, 20, y); y += 10; });
    doc.save(`${data.student}_Report.pdf`);
}
async function generateClassReport() {
    const id = document.getElementById('reportStreamId').value;
    const res = await fetch(`${API_URL}/reports/streams/${id}/ranking`);
    const data = await res.json();
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.text(`Class Performance Ranking`, 20, 20);
    const tableData = data.map(d => [d.position, d.first_name, d.last_name, d.total_marks]);
    doc.autoTable({ startY: 30, head: [['Rank', 'First Name', 'Last Name', 'Total Marks']], body: tableData });
    doc.save(`Class_${id}_Ranking.pdf`);
}
async function fetchStudents() {
    const res = await fetch(`${API_URL}/students`);
    const students = await res.json();
    const list = document.getElementById('studentList');
    list.innerHTML = '';
    students.forEach(s => {
        const li = document.createElement('li');
        li.innerHTML = `[ID: ${s.id}] <strong>${s.first_name} ${s.last_name}</strong> - Stream: ${s.stream_name || 'None'} 
        <button onclick="deleteStudent(${s.id})" style="background:red; padding:2px 5px; margin-left:10px;">Delete</button>`;
        list.appendChild(li);
    });
}
async function deleteStudent(id) {
    if(confirm('Delete this student?')) {
        await fetch(`${API_URL}/students/${id}`, { method: 'DELETE' });
        fetchStudents();
    }
}
// --- NEW EDIT & VIEW FUNCTIONS ---
async function viewStudent() {
    const res = await fetch(`${API_URL}/students/${document.getElementById('viewStudentId').value}`);
    const data = await res.json();
    document.getElementById('viewResults').innerText = data ? `ID: ${data.id} | Name: ${data.first_name} ${data.last_name} | Stream ID: ${data.stream_id}` : 'Not found';
}

async function viewStreamStudents() {
    const res = await fetch(`${API_URL}/streams/${document.getElementById('viewStreamId').value}/students`);
    const data = await res.json();
    document.getElementById('viewResults').innerText = data.length ? data.map(s => `${s.first_name} ${s.last_name}`).join(', ') : 'No students found';
}

document.getElementById('editStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/students/${document.getElementById('editStuId').value}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: document.getElementById('editFName').value, last_name: document.getElementById('editLName').value, stream_id: document.getElementById('editStream').value })
    }); 
    alert('Student Updated!'); document.getElementById('editStudentForm').reset(); fetchStudents();
});

document.getElementById('editSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/subjects/${document.getElementById('editSubId').value}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('editSubName').value })
    }); 
    alert('Subject Updated!'); document.getElementById('editSubjectForm').reset();
});

async function deleteSubject() {
    const id = document.getElementById('editSubId').value;
    if(!id) return alert('Enter a Subject ID to delete');
    if(confirm('Delete this subject?')) {
        await fetch(`${API_URL}/subjects/${id}`, { method: 'DELETE' });
        alert('Subject Deleted!'); document.getElementById('editSubjectForm').reset();
    }
}
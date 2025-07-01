import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LecturerLayout from './LecturerLayout';

const StudentsPage = () => {
  const { id } = useParams(); // course ID
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/courses/${id}/students`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json();
      })
      .then(setStudents)
      .catch(err => {
        console.error(err);
        setError("Could not load students");
      });
  }, [id]);

  return (
    <LecturerLayout>
      <h2>Enrolled Students in Course {id}</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {students.length === 0 && !error && (
        <p>No students enrolled yet.</p>
      )}

      <ul style={listStyle}>
        {students.map(student => (
          <li key={student.id} style={cardStyle}>
            <strong>{student.name}</strong><br />
            Email: {student.email}<br />
            Role: {student.role}
          </li>
        ))}
      </ul>
    </LecturerLayout>
  );
};

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '6px',
  padding: '10px',
  margin: '10px 0',
  listStyle: 'none'
};

const listStyle = {
  padding: 0
};

export default StudentsPage;


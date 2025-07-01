import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout'; 

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.id;

  {Array.isArray(courses) ? (
    courses.map(course => (
      <div key={course.id}>{course.title}</div>
    ))
  ) : (
    <p>Loading or no courses found.</p>
  )}

  

  useEffect(() => {
    if (!token || !studentId) {
      console.error("Missing token or student ID");
      return;
    }

    fetch(`https://lite-lms-7dkg.onrender.com/students/${studentId}/courses`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch courses");
        return res.json();
      })
      .then(setCourses)
      .catch(console.error);
  }, [token, studentId]);

  return (
    <StudentLayout>
      <h1>Welcome, {user?.name || "Student"}</h1>
      <h2>My Enrolled Courses</h2>
      {courses.length === 0 ? (
        <p>You are not enrolled in any courses.</p>
      ) : (
        <ul style={listStyle}>
          {courses.map(course => (
            <li key={course.id} style={cardStyle}>
              <h3>{course.name} ({course.code})</h3>
              <p>Semester: {course.semester}</p>
              <p>Instructor: {course.teacher?.name || 'TBA'}</p>
              <Link to={`/student/courses/${course.id}/lessons`} style={btnStyle}>View Lessons</Link>
              <Link to={`/student/courses/${course.id}/assignments`} style={{ ...btnStyle, marginLeft: '10px' }}>View Assignments</Link>
            </li>
          ))}
        </ul>
      )}
    </StudentLayout>
  );
};

const listStyle = {
  listStyle: 'none',
  padding: 0,
};

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '10px',
};

const btnStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '6px 12px',
  textDecoration: 'none',
  borderRadius: '4px'
};

export default StudentCourses;

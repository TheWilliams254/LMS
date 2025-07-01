import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import LecturerSidebar from './LecturerSidebar';

const LecturerDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newCourse, setNewCourse] = useState({name: '',code: '',semester: ''});
  const user = JSON.parse(localStorage.getItem("user"));


  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('https://lite-lms-7dkg.onrender.com/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };

    fetchCourses();
  }, []);

  const handleUpdateCourse = (updatedCourse) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const handleCreateCourse = async () => {
    // Get user from localStorage safely
    const userString = localStorage.getItem("user");

    if (!userString) {
      alert("User not found. Please log in again.");
      return;
    }

    let user;
    try {
      user = JSON.parse(userString);
    } catch (error) {
      alert("Failed to read user info. Please log in again.");
      return;
    }

    const teacher_id = user?.id;

    if (!teacher_id) {
      alert("Teacher ID not found. Please log in again.");
      return;
    }

    const payload = {
      name: newCourse.name,
      code: newCourse.code,
      semester: parseInt(newCourse.semester),
      teacher_id: teacher_id,
    };

    console.log("📦 Sending course data:", payload);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://127.0.0.1:8000/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const added = await res.json();
        setCourses([...courses, added]);
        setNewCourse({ name: "", code: "", semester: "" });
        setFormVisible(false);
        alert("✅ Course created successfully.");
      } else {
        const error = await res.json();
        console.error("❌ Failed to create course:", error);
        alert("Failed to create course: " + (error?.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("🔥 Error creating course:", err);
      alert("Network error while creating course.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <LecturerSidebar />

      <div style={{ flex: 1, padding: '30px' }}>
        <h1>Welcome, {user?.name || "Lecturer"}</h1>

        <button onClick={() => setFormVisible(!formVisible)} style={btnStyle}>
          {formVisible ? 'Cancel' : '+ Create Course'}
        </button>

        {formVisible && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Course Name"
              value={newCourse.name}
              onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
              style={inputStyle}
            />
            <br />
            <input
              type="text"
              placeholder="Course Code"
              value={newCourse.code}
              onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
              style={inputStyle}
            />
            <br />
            <input
              type="number"
              placeholder="Semester"
              value={newCourse.semester}
              onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
              style={inputStyle}
            />

            <br />
            <button onClick={handleCreateCourse} style={btnStyle}>Submit</button>
          </div>
        )}

        <h2 style={{ marginTop: '30px' }}>My Courses</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '10px' }}>
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onUpdate={handleUpdateCourse}
              onDelete={handleDeleteCourse}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '8px 12px',
  backgroundColor: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px'
};

const inputStyle = {
  padding: '8px',
  margin: '5px 0',
  width: '100%',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

export default LecturerDashboard;

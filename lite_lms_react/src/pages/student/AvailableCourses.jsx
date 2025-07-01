import React, { useEffect, useState } from 'react';

const AvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('https://lite-lms-7dkg.onrender.com/courses', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
      .then(res => res.json())
      .then(setCourses)
      .catch(err => console.error("Failed to load courses:", err));
  }, []);

  const handleEnroll = (courseId) => {
    fetch(`https://lite-lms-7dkg.onrender.com/students/${user.id}/enroll`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ course_id: courseId })
    })
      .then(res => {
        if (res.ok) alert("Enrolled successfully!");
        else throw new Error("Enrollment failed.");
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Available Courses</h2>
      {courses.map(course => (
        <div key={course.id} className="border p-3 mb-2 rounded">
          <h3 className="font-semibold">{course.name}</h3>
          <p>Code: {course.code}</p>
          <p>Semester: {course.semester}</p>
          <button
            onClick={() => handleEnroll(course.id)}
            className="bg-blue-500 text-white px-4 py-1 rounded mt-2"
          >
            Enroll
          </button>
        </div>
      ))}
    </div>
  );
};

export default AvailableCourses;

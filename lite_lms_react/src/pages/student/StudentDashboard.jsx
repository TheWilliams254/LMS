import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StudentLayout from "../../components/StudentLayout";

const StudentDashboard = () => {
  const [user, setUser] = useState({});
  const [courses, setCourses] = useState([]);
  const token = localStorage.getItem("token");
  const studentId = JSON.parse(localStorage.getItem("user"))?.id;

  useEffect(() => {
    // Set user info
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser(userData);
    }

    // Fetch student's courses
    if (studentId) {
      fetch(`https://lite-lms-7dkg.onrender.com/students/${studentId}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch courses");
          return res.json();
        })
        .then(setCourses)
        .catch((err) => {
          console.error("Failed to fetch courses:", err);
        });
    }
  }, [studentId]);

  return (
    <StudentLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.name || "Student"}!</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Your Courses</h2>
        <ul className="list-disc pl-6">
          {courses.length > 0 ? (
            courses.map((course) => (
              <li key={course.id}>
                <Link
                  to={`/student/courses/${course.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {course.name} ({course.code})
                </Link>
              </li>
            ))
          ) : (
            <li>You are not enrolled in any courses.</li>
          )}
        </ul>
      </div>

      <Link
        to="/student/courses"
        className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        View All Courses
      </Link>
      <Link to="/student/courses/available" className="btn">View All Courses</Link>
      <Link to="/student/courses" className="btn ml-2">My Courses</Link>

    </StudentLayout>
  );
};

export default StudentDashboard;

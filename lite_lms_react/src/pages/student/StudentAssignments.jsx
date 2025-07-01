import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentAssignments = () => {
  const { id: courseId } = useParams(); // course ID from route
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/courses/${courseId}/assignments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch assignments");
        return res.json();
      })
      .then(setAssignments)
      .catch((err) => {
        console.error(err);
        setError("Could not load assignments.");
      });
  }, [courseId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (assignments.length === 0) return <p>No assignments found.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Assignments</h1>
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="border rounded-lg p-4 mb-4 shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">{assignment.title}</h2>
          <p className="text-gray-700 mt-2">{assignment.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Due: {assignment.due_date}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StudentAssignments;

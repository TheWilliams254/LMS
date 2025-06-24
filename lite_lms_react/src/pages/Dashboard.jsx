// src/pages/Dashboard.js
import React from 'react';
import './Dashboard.css';

function Dashboard() {
  // Simulate role from localStorage (in real app, use state/context)
  const role = localStorage.getItem("role") || "student"; // fallback for demo
  const name = localStorage.getItem("name") || "User";

  return (
    <div className="dashboard">
      <h2>Welcome back, {name}!</h2>
      <p>You are logged in as a <strong>{role}</strong>.</p>

      {role === "student" ? (
        <div className="dashboard-section">
          <h3>Your Actions</h3>
          <ul>
            <li>📚 View and Enroll in Courses</li>
            <li>📝 View Lessons and Assignments</li>
            <li>✅ Submit Assignments</li>
            <li>📈 Track your Progress</li>
          </ul>
        </div>
      ) : (
        <div className="dashboard-section">
          <h3>Your Tools</h3>
          <ul>
            <li>➕ Create and Manage Courses</li>
            <li>📄 Add Lessons and Assignments</li>
            <li>🧑‍🎓 View Enrolled Students</li>
            <li>✅ Grade Submissions</li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

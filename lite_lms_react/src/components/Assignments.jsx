import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LecturerLayout from './LecturerLayout';
import { Link } from 'react-router-dom';
import "./Assignments.css";

const Assignments= () => {
  const { id } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({ title: '', description: '', due_date: '' });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/${id}/assignments`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setAssignments)
      .catch(console.error);
  }, [id]);

  const handleAddAssignment = async () => {
  if (!window.confirm("Add this assignment?")) return;

  const payload = {
    title: formData.title,
    description: formData.description,
    due_date: formData.due_date || null,
    course_id: parseInt(id)
  };

  const res = await fetch(`http://127.0.0.1:8000/courses/${id}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    const added = await res.json();
    setAssignments([...assignments, added]);
    setFormData({ title: '', description: '', due_date: '' });
  }
  };


  const handleDelete = async (assignmentId) => {
    if (!window.confirm("Delete this assignment?")) return;

    const res = await fetch(`http://127.0.0.1:8000/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    }
  };

  const handleSave = async (assignment) => {
    const payload = {
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date || null, // optional field
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updated = await res.json();
        setAssignments(assignments.map(a => a.id === updated.id ? updated : a));
      } else {
        const error = await res.json();
        console.error("❌ Save failed:", error);
        alert("Update failed: " + (error.detail || "Unknown error"));
      }
    } catch (err) {
      console.error("🔥 Error during assignment update:", err);
      alert("Network error while updating assignment.");
    }
  };


  return (
    <LecturerLayout>
      <div className="assignments-page">
        <h2 className="assignments-heading">Assignments for Course {id}</h2>

        <div className="assignment-form">
          <input
            type="text"
            placeholder="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder="Assignment Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
          <button className="btn add-btn" onClick={handleAddAssignment}>Add Assignment</button>
        </div>

        <hr className="divider" />

        <div className="assignments-list">
          {assignments.map((a) => (
            <div key={a.id} className="assignment-card">
              <input
                type="text"
                value={a.title}
                onChange={(e) =>
                  setAssignments(assignments.map(item => item.id === a.id ? { ...item, title: e.target.value } : item))
                }
              />
              <textarea
                value={a.description}
                onChange={(e) =>
                  setAssignments(assignments.map(item => item.id === a.id ? { ...item, description: e.target.value } : item))
                }
              />
              <input
                type="date"
                value={a.due_date}
                onChange={(e) =>
                  setAssignments(assignments.map(item => item.id === a.id ? { ...item, due_date: e.target.value } : item))
                }
              />

              <div className="assignment-actions">
                <button className="btn save-btn" onClick={() => handleSave(a)}>Save</button>
                <button className="btn delete-btn" onClick={() => handleDelete(a.id)}>Delete</button>
                <Link to={`/assignments/${a.id}/submissions`}>
                  <button className="btn submissions-btn">View Submissions</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LecturerLayout>
  );
};

const inputStyle = {
  width: '100%',
  margin: '5px 0',
  padding: '8px'
};

const btnStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  padding: '6px 12px',
  border: 'none',
  marginTop: '10px',
  cursor: 'pointer',
  borderRadius: '4px'
};

const deleteBtn = {
  backgroundColor: '#dc3545',
  color: 'white',
  padding: '6px 12px',
  border: 'none',
  marginLeft: '10px',
  borderRadius: '4px',
  cursor: 'pointer'
};

const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '6px',
  padding: '10px',
  marginTop: '15px'
};

export default Assignments;

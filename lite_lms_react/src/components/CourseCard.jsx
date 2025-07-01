import { useState } from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description
  });

  const token = localStorage.getItem("token");

  const handleSave = async () => {
    try {
      const res = await fetch(`https://lite-lms-7dkg.onrender.com/courses/${course.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating course:", err);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      fetch(`http://127.0.0.1:8000/courses/${course.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (res.ok) {
            onDelete(course.id);
          }
        })
        .catch(console.error);
    }
  };

  return (
    <div style={cardStyle}>
      {isEditing ? (
        <>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            style={inputStyle}
          />
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={inputStyle}
          />
          <button onClick={handleSave} style={saveBtn}>Save</button>
          <button onClick={() => setIsEditing(false)} style={cancelBtn}>Cancel</button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold">{course.name}</h3>
          <p><strong>Code:</strong> {course.code}</p>
          <p><strong>Semester:</strong> {course.semester}</p>
          <p><strong>Instructor:</strong> {course.teacher?.name || "Not Assigned"}</p>
          <p><strong>Lessons:</strong> {course.lessons?.length || 0}</p>
          <p><strong>Assignments:</strong> {course.assignments?.length || 0}</p>
          <p><strong>Enrolled Students:</strong> {course.students?.length || 0}</p>

          <Link to={`/dashboard/courses/${course.id}/lessons`} style={linkBtn}>Lessons</Link>
          <Link to={`/dashboard/courses/${course.id}/assignments`} style={linkBtn}>Assignments</Link>
          <Link to={`/dashboard/courses/${course.id}/students`} style={linkBtn}>Students</Link>
          <br />
          <button onClick={() => setIsEditing(true)} style={editBtn}>Edit</button>
          <button onClick={handleDelete} style={deleteBtn}>Delete</button>
        </>
      )}
    </div>
  );
};

const cardStyle = {
  border: '1px solid #ccc',
  padding: '15px',
  borderRadius: '8px',
  width: '300px'
};

const inputStyle = {
  width: '100%',
  marginBottom: '8px',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const linkBtn = {
  display: 'inline-block',
  margin: '5px 5px 5px 0',
  backgroundColor: '#007bff',
  color: 'white',
  padding: '6px 10px',
  borderRadius: '4px',
  textDecoration: 'none'
};

const editBtn = {
  backgroundColor: '#ffc107',
  color: 'black',
  marginRight: '10px',
  padding: '6px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const deleteBtn = {
  backgroundColor: '#dc3545',
  color: 'white',
  padding: '6px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const saveBtn = {
  backgroundColor: '#28a745',
  color: 'white',
  marginRight: '10px',
  padding: '6px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

const cancelBtn = {
  backgroundColor: '#6c757d',
  color: 'white',
  padding: '6px 10px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export default CourseCard;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LecturerLayout from './LecturerLayout';
import "./Lessons.css";

const Lessons = () => {
  const { id } = useParams();
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [video, setVideo] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/courses/${id}/lessons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setLessons)
      .catch(console.error);
  }, [id]);

  const handleAddLesson = async () => {
    if (!window.confirm("Add this lesson?")) return;

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('content', formData.content);
      if (video) form.append('video', video);

      const res = await fetch(`http://127.0.0.1:8000/courses/${id}/lessons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });

      if (res.ok) {
        const added = await res.json();
        setLessons([...lessons, added]);
        setFormData({ title: '', content: '' });
        setVideo(null);
      }
    } catch (err) {
      console.error('Error adding lesson:', err);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLessons(lessons.filter(l => l.id !== lessonId));
      }
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleSave = async (lesson) => {
  try {
    const form = new FormData();
    form.append("title", lesson.title);
    form.append("content", lesson.content);
    if (lesson.newVideoFile) {
      form.append("video", lesson.newVideoFile);
    }

    const res = await fetch(`http://127.0.0.1:8000/lessons/${lesson.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`, // ✅ NO "Content-Type" with FormData
      },
      body: form,
    });

    if (res.ok) {
      const updated = await res.json();
      setLessons(lessons.map((l) => (l.id === updated.id ? updated : l)));
    } else {
      const error = await res.json();
      console.error("❌ Save failed:", error);
      alert(error?.detail || "Save failed");
    }
  } catch (err) {
    console.error("Error updating:", err);
  }
  };


  return (
    <LecturerLayout>
      <div className="lessons-page">
        <h2 className="lessons-heading">Lessons for Course {id}</h2>

        <div className="lesson-form">
          <input
            type="text"
            placeholder="Lesson Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <textarea
            placeholder="Lesson Content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideo(e.target.files[0])}
          />
          <button className="btn add-btn" onClick={handleAddLesson}>Add Lesson</button>
        </div>

        <hr className="divider" />

        <div className="lessons-list">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <input
                type="text"
                value={lesson.title}
                onChange={(e) =>
                  setLessons(lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l))
                }
              />
              <textarea
                value={lesson.content}
                onChange={(e) =>
                  setLessons(lessons.map(l => l.id === lesson.id ? { ...l, content: e.target.value } : l))
                }
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) =>
                  setLessons(lessons.map(l =>
                    l.id === lesson.id ? { ...l, newVideoFile: e.target.files[0] } : l
                  ))
                }
              />

              {lesson.video_url && (
                <video width="320" controls>
                  <source src={lesson.video_url} />
                </video>
              )}

              <div className="lesson-actions">
                <button className="btn save-btn" onClick={() => handleSave(lesson)}>Save</button>
                <button className="btn delete-btn" onClick={() => handleDelete(lesson.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </LecturerLayout>
  );
}

export default Lessons;

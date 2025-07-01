import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentLessons = () => {
  const { id: courseId } = useParams(); // course ID from URL
  const [lessons, setLessons] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/courses/${courseId}/lessons`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch lessons");
        return res.json();
      })
      .then(setLessons)
      .catch((err) => {
        console.error(err);
        setError("Could not load lessons.");
      });
  }, [courseId]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (lessons.length === 0) return <p>No lessons found for this course.</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Course Lessons</h1>
      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="border rounded-lg p-4 mb-4 shadow hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">{lesson.title}</h2>
          <p className="text-gray-700 mt-2">{lesson.content}</p>
          {lesson.video_url && (
            <div className="mt-4">
              <video
                src={lesson.video_url}
                controls
                className="w-full rounded"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentLessons;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudentSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`https://lite-lms-7dkg.onrender.com/assignments/${assignmentId}/my-submissions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submissions");
        return res.json();
      })
      .then(setSubmissions)
      .catch((err) => {
        console.error(err);
        setError("Could not load submissions.");
      });
  }, [assignmentId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch(`https://lite-lms-7dkg.onrender.com/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submission failed");
        return res.json();
      })
      .then((newSubmission) => {
        setSubmissions((prev) => [...prev, newSubmission]);
        setFile(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to submit assignment.");
      });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Submissions</h2>

      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>

      {submissions.length === 0 ? (
        <p>No submissions yet.</p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li
              key={s.id}
              className="border p-4 rounded shadow flex flex-col gap-1"
            >
              <a
                href={`http://127.0.0.1:8000/${s.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                View Submitted File
              </a>
              <p>
                <strong>Submitted on:</strong>{" "}
                {new Date(s.timestamp).toLocaleString()}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {s.reviewed ? (
                  <span className="text-green-600">Reviewed</span>
                ) : (
                  <span className="text-yellow-500">Pending Review</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentSubmissions;

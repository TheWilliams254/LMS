import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch('https://lite-lms-7dkg.onrender.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // Save token and user to localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        alert(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('An error occurred while logging in.');
    }
  }

  return (
    <div className="login-container">
      <h2>Login to LearnHub</h2>
      <form onSubmit={handleSubmit} className="login-form" noValidate>
        <label>Email</label>
        <input
          type="email"
          placeholder="e.g. you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>

      <p className="redirect-text">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;

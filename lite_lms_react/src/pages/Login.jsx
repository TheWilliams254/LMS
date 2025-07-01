import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();

  try {
    const response = await fetch('https://lite-lms-7dkg.onrender.com/login', {
      email,
      password,
    });

    // Check if response contains access_token
    if (response.status === 200 && response.data.access_token) {
      const { access_token, id, name, role } = response.data;

      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));


      // Navigate to dashboard
      navigate('/dashboard');
    } else {
      alert('Unexpected response from server.');
      console.error('Unexpected login response:', response);
    }
  } catch (err) {
    // Show actual backend message
    const msg = err.response?.data?.detail || 'Login failed';
    console.error('Login error:', err);
    alert(msg);
  }
  }



  return (
    <div className="login-container">
      <h2>Login to LearnHub</h2>
      <form onSubmit={handleSubmit} className="login-form">
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
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;

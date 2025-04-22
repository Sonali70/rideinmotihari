import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';  // Assuming you have axios instance set up
import './login.css';  // Optional: your styling file

function UserLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '' // Updated to match backend column name
  });

  // Handling form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handling form submission (login/register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? 'login' : 'register';  // Determine endpoint based on login/register state
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { ...formData };  // Passing formData directly in case of registration

    try {
      // Sending request to backend
      const res = await axiosInstance.post(`/users/${endpoint}`, payload);

      // Storing token and user details in localStorage
      localStorage.setItem("token", res.data.user.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user_id", res.data.user.user_id);

      if (isLogin) {
        navigate('/user-home'); // Redirect to User Home after login
      } else {
        setIsLogin(true); // Switch to login form after successful registration
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 404
          ? 'User not found'
          : 'An error occurred. Please try again.');
      setError(errorMessage); // Show error message from backend
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>{isLogin ? "User Login" : "User Registration"}</h1>
        </div>

        {error && <p className="error-msg">{error}</p>} {/* Display error message */}

        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="submit" className="primary-btn">Login</button>
            </>
          ) : (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <button type="submit" className="primary-btn">Register</button>
            </>
          )}
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="toggle-btn"
        >
          {isLogin ? "New here? Register" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}

export default UserLogin;

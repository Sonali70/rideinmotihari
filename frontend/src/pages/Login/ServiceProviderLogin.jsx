import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';
import axiosInstance from '../../utils/axiosInstance';

function ServiceProviderLogin() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile_no: '',
    location: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? 'login' : 'register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await axiosInstance.post(`/service-providers/${endpoint}`, payload);
      console.log("Login Response:", res);

      if (isLogin) {
        const { token, provider_id, role } = res.data;

        // Store in local storage
        localStorage.setItem('token', res.data.provider.token);
        localStorage.setItem('role', role || 'service_provider');
        localStorage.setItem('user_id', res.data.provider.provider_id);

        navigate('/service-provider-home');
      } else {
        alert('Registered successfully! Please log in.');
        setIsLogin(true); // Switch to login view
      }

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <h1>{isLogin ? "Service Provider Login" : "Service Provider Registration"}</h1>
        </div>

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
                name="mobile_no"
                placeholder="Mobile Number" 
                value={formData.mobile_no}
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

export default ServiceProviderLogin;

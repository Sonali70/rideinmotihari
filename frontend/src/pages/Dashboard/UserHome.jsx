import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import './UserHome.css';

function UserHome() {
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [providerServices, setProviderServices] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showChangePasswordPopup, setShowChangePasswordPopup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distance, setDistance] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('');
  const [userBookings, setUserBookings] = useState([]);

  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axiosInstance.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDetails(res.data);
      } catch (err) {
        setError('Failed to load user details');
      }
    };

    const fetchServiceProviders = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/service-providers/approvedproviders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setServiceProviders(res.data);

        const allTypes = {};
        for (const provider of res.data) {
          const typesRes = await axiosInstance.get(`/service-types/providers/${provider.provider_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          allTypes[provider.provider_id] = typesRes.data;
        }
        setProviderServices(allTypes);
      } catch (err) {
        setError('Failed to load service providers');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookings = async () => {
      try {
        const res = await axiosInstance.get(`/bookings/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserBookings(res.data);
      } catch (err) {
        console.error('Failed to load bookings', err);
      }
    };

    fetchUserDetails();
    fetchServiceProviders();
    fetchBookings();
  }, [userId, token]);

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout', {}, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'user-id': userId
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    navigate('/userlogin');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setError('Password must be at least 8 characters long, include at least 1 lowercase, 1 uppercase, 2 digits, and 1 special character.');
      return;
    }

    try {
      await axiosInstance.put(`/users/${userId}/change-password`, { newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Password changed successfully');
      setNewPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed';
      setError(msg);
    }
  };

  const handleBookNow = (provider) => {
    setSelectedProvider(provider);
    setPickup('');
    setDrop('');
    setDistance('');
    setSelectedServiceType('');
    setShowPopup(true);
  };

  const handleConfirmRide = async () => {
    if (!pickup || !drop || !selectedServiceType || !distance) {
      alert('Please fill all fields');
      return;
    }

    try {
      await axiosInstance.post('/bookings', {
        user_id: userId,
        provider_id: selectedProvider.provider_id,
        pickup_location: pickup,
        drop_location: drop,
        service_type: selectedServiceType,
        distance: parseFloat(distance)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Booking successful!');
      setShowPopup(false);

      const res = await axiosInstance.get(`/bookings/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserBookings(res.data);
    } catch (error) {
      alert('Failed to book ride');
      console.error(error);
    }
  };

  return (
    <div className="user-home-container">
      <header className="user-header">
        <h2>Welcome, {userDetails?.name}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowChangePasswordPopup(true)} className="logout-btn" style={{ backgroundColor: '#007bff' }}>
            Change Password
          </button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <section className="providers-section">
        <h2>Available Service Providers</h2>
        {loading ? (
          <p>Loading providers...</p>
        ) : (
          <div className="providers-cards">
            {serviceProviders.map((provider) => (
              <div key={provider.provider_id} className="provider-card">
                <h3>{provider.name}</h3>
                <p>{provider.location}</p>
                <p>Status: {provider.status}</p>
                <p>
                  Services: {providerServices[provider.provider_id]?.join(', ') || 'None'}
                </p>
                <button onClick={() => handleBookNow(provider)}>Book Now</button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="bookings-section">
        <h2>My Bookings</h2>
        {userBookings.length > 0 ? (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Drop</th>
                <th>Distance (km)</th>
                <th>Cost</th>
                <th>Service</th>
                <th>Status</th>
                <th>Booked At</th>
              </tr>
            </thead>
            <tbody>
              {userBookings.map((booking) => (
                <tr key={booking.booking_id}>
                  <td>{booking.pickup_location}</td>
                  <td>{booking.drop_location}</td>
                  <td>{booking.distance}</td>
                  <td>{booking.cost}</td>
                  <td>{booking.service_type}</td>
                  <td>{booking.status}</td>
                  <td>{moment(booking.booked_at).format('DD MMM YYYY, h:mm A')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No bookings found.</p>
        )}
      </section>

      {showPopup && selectedProvider && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Book a Ride with {selectedProvider.name}</h3>
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Drop Location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Distance (in km)"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              required
            />
            <select
              value={selectedServiceType}
              onChange={(e) => setSelectedServiceType(e.target.value)}
              required
            >
              <option value="">Select Service Type</option>
              {providerServices[selectedProvider.provider_id]?.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
            <div className="popup-buttons">
              <button onClick={handleConfirmRide}>Confirm</button>
              <button onClick={() => setShowPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showChangePasswordPopup && (
        <div className="popup-overlay">
          <div className="popup-form">
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="popup-buttons">
                <button type="submit">Change</button>
                <button type="button" onClick={() => setShowChangePasswordPopup(false)}>Cancel</button>
              </div>
            </form>
            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserHome;

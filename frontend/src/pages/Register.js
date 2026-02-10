import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    name: '',
    email: '',
    // Student-specific
    country: '',
    category: 'Undergraduate',
    skill_level: 'Beginner',
    age: '',
    // Instructor-specific
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        email: formData.email,
      };

      // Add role-specific data
      if (formData.role === 'Student') {
        dataToSend.country = formData.country;
        dataToSend.category = formData.category;
        dataToSend.skill_level = formData.skill_level;
        dataToSend.age = parseInt(formData.age);
      } else if (formData.role === 'Instructor') {
        dataToSend.experience = parseInt(formData.experience) || 0;
      }

      const response = await authAPI.register(dataToSend);
      login(response.data.token, response.data.user);
      
      // Redirect based on role
      switch (response.data.user.role) {
        case 'Student':
          navigate('/student');
          break;
        case 'Instructor':
          navigate('/instructor');
          break;
        case 'Data_Analyst':
          navigate('/analyst');
          break;
        case 'Administrator':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box" style={{ maxWidth: '600px' }}>
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join our educational platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Role
            </label>
            <select
              id="role"
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          {/* Student-specific fields */}
          {formData.role === 'Student' && (
            <>
              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  placeholder="Enter your country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Graduate">Graduate</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="skill_level" className="form-label">
                  Skill Level
                </label>
                <select
                  id="skill_level"
                  name="skill_level"
                  className="form-control"
                  value={formData.skill_level}
                  onChange={handleChange}
                  required
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-control"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="16"
                  max="100"
                  placeholder="Enter your age"
                />
              </div>
            </>
          )}

          {/* Instructor-specific fields */}
          {formData.role === 'Instructor' && (
            <div className="form-group">
              <label htmlFor="experience" className="form-label">
                Years of Experience
              </label>
              <input
                type="number"
                id="experience"
                name="experience"
                className="form-control"
                value={formData.experience}
                onChange={handleChange}
                required
                min="0"
                max="50"
                placeholder="Enter years of teaching experience"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-link">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
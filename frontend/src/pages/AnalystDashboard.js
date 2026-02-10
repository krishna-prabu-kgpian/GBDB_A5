import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analystAPI } from '../services/api';
import { BarChart3, LogOut } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const COLORS = ['#667eea', '#4facfe', '#51cf66', '#ff6b6b', '#ffd43b', '#ff8c42'];

function AnalystDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await analystAPI.getStatistics();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="paper-container">
        <h1>Error loading statistics</h1>
      </div>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
          Analytics Dashboard
        </div>
        <div className="navbar-nav">
          <span className="nav-link" style={{ cursor: 'default' }}>Welcome, {user?.name}</span>
          <button onClick={handleLogout} className="btn btn-sm btn-danger">
            <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Logout
          </button>
        </div>
      </nav>

      <div className="paper-container">
        <div className="welcome-section">
          <h1 className="welcome-title">Analytics Dashboard</h1>
          <p className="welcome-subtitle">Welcome back, {user?.name}! View platform insights and statistics</p>
        </div>

        {/* Overview Stats */}
        <h2 className="mt-4 mb-3">Overview</h2>
        <div className="stats-grid mb-4">
          <div className="stat-card">
            <span className="stat-value">{stats.total_students}</span>
            <span className="stat-label">Total Students</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_instructors}</span>
            <span className="stat-label">Total Instructors</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_courses}</span>
            <span className="stat-label">Total Courses</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total_enrollments}</span>
            <span className="stat-label">Total Enrollments</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">${stats.total_revenue?.toLocaleString() || 0}</span>
            <span className="stat-label">Total Revenue</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completion_stats?.completion_rate}%</span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>

        {/* Student Demographics */}
        <h2 className="mt-4 mb-3">Student Demographics</h2>
        <div className="grid-2 mb-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Students by Country</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.students_by_country.map((item, index) => (
                      <tr key={index}>
                        <td>{item.country}</td>
                        <td><strong>{item.count}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Students by Skill Level</h3>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.students_by_skill}
                    dataKey="count"
                    nameKey="skill_level"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {stats.students_by_skill.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Analytics */}
        <h2 className="mt-4 mb-3">Performance Analytics</h2>
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Average Score by Skill Level</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Skill Level</th>
                    <th>Average Score</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.avg_score_by_skill.map((item, index) => (
                    <tr key={index}>
                      <td><span className="badge">{item.skill_level}</span></td>
                      <td><strong>{parseFloat(item.avg_score).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <h2 className="mt-4 mb-3">Top Performing Students</h2>
        <div className="card mb-4">
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Average Score</th>
                    <th>Courses Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.top_students.slice(0, 10).map((student, index) => (
                    <tr key={index}>
                      <td><strong>#{index + 1}</strong></td>
                      <td>{student.name}</td>
                      <td><span className="badge badge-success">{parseFloat(student.avg_score).toFixed(2)}</span></td>
                      <td>{student.courses_taken}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Revenue Analysis */}
        <h2 className="mt-4 mb-3">Revenue & Course Analytics</h2>
        <div className="grid-2 mb-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Most Popular Courses</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Enrollments</th>
                      <th>Avg Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.popular_courses.slice(0, 5).map((course, index) => (
                      <tr key={index}>
                        <td>{course.name}</td>
                        <td><span className="badge badge-info">{course.enrollment_count}</span></td>
                        <td>{course.avg_score ? parseFloat(course.avg_score).toFixed(2) : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Revenue by Course</h3>
            </div>
            <div className="card-body">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Fees</th>
                      <th>Enrollments</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.revenue_by_course.slice(0, 5).map((course, index) => (
                      <tr key={index}>
                        <td>{course.name}</td>
                        <td>${course.fees}</td>
                        <td>{course.enrollments}</td>
                        <td><strong>${course.total_revenue?.toLocaleString() || 0}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AnalystDashboard;

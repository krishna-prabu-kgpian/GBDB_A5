import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import { Users, BookOpen, UserPlus, FilePlus, Settings, LogOut } from 'lucide-react';

function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardItems = [
    {
      icon: <Users size={48} />,
      title: 'User Management',
      description: 'Manage all users in the system',
      path: '/admin/users'
    },
    {
      icon: <BookOpen size={48} />,
      title: 'Course Management',
      description: 'View and manage all courses',
      path: '/admin/courses'
    },
    {
      icon: <UserPlus size={48} />,
      title: 'Create User',
      description: 'Add new users to the platform',
      path: '/admin/create-user'
    },
    {
      icon: <FilePlus size={48} />,
      title: 'Create Course',
      description: 'Create new courses',
      path: '/admin/create-course'
    }
  ];

  return (
    <div className="paper-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Admin Dashboard</h1>
        <p className="welcome-subtitle">Welcome back, {user?.name}! Manage your platform</p>
      </div>

      <div className="dashboard-grid">
        {dashboardItems.map((item, index) => (
          <div
            key={index}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
          >
            <span className="dashboard-card-icon">{item.icon}</span>
            <h3 className="dashboard-card-title">{item.title}</h3>
            <p className="dashboard-card-description">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/admin" className="navbar-brand">
        <Settings size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Admin Panel
      </Link>
      <div className="navbar-nav">
        <button onClick={handleLogout} className="btn btn-sm btn-danger">
          <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Logout
        </button>
      </div>
    </nav>
  );
}

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setMessage('Error loading users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user: ${userName}?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setMessage('User deleted successfully');
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error deleting user');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      await adminAPI.changePassword(selectedUser.user_id, newPassword);
      setMessage('Password changed successfully');
      setSelectedUser(null);
      setNewPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error changing password');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <h1>User Management</h1>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Search Users</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Filter by Role</label>
              <select
                className="form-control"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Student">Students</option>
                <option value="Instructor">Instructors</option>
                <option value="Data_Analyst">Data Analysts</option>
                <option value="Administrator">Administrators</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === 'Student').length}</span>
          <span className="stat-label">Students</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === 'Instructor').length}</span>
          <span className="stat-label">Instructors</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === 'Data_Analyst').length}</span>
          <span className="stat-label">Analysts</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === 'Administrator').length}</span>
          <span className="stat-label">Admins</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">All Users ({filteredUsers.length})</h3>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td><code>{user.user_id}</code></td>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${
                        user.role === 'Student' ? 'badge-info' :
                        user.role === 'Instructor' ? 'badge-success' :
                        user.role === 'Data_Analyst' ? '' :
                        'badge-danger'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="btn btn-sm"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id, user.name)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>User:</strong> {selectedUser.name} ({selectedUser.username})
              </p>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter new password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                  />
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    Change Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setNewPassword('');
                    }}
                    className="btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await adminAPI.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      setMessage('Error loading courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (!window.confirm(`Are you sure you want to delete course: ${courseName}?`)) {
      return;
    }

    try {
      await adminAPI.deleteCourse(courseId);
      setMessage('Course deleted successfully');
      fetchCourses();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error deleting course');
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <h1>Course Management</h1>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      {/* Search */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Search Courses</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by course name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid">
        {filteredCourses.map((course) => (
          <div key={course.course_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{course.name}</h3>
              <span className="badge">{course.course_id}</span>
            </div>
            <div className="card-body">
              <p><strong>Duration:</strong> {course.duration} weeks</p>
              <p><strong>Fees:</strong> ${course.fees}</p>
              <p><strong>Enrolled Students:</strong> {course.enrolled_students || 0}</p>
              <p><strong>Instructors:</strong> {course.instructor_count || 0}</p>
            </div>
            <div className="card-footer">
              <button
                onClick={() => handleDeleteCourse(course.course_id, course.name)}
                className="btn btn-danger btn-sm"
              >
                Delete Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="alert alert-info">
          No courses found matching your search.
        </div>
      )}
    </div>
  );
}

function CreateUser() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'Student',
    name: '',
    email: '',
    country: '',
    category: 'Undergraduate',
    skill_level: 'Beginner',
    age: '',
    experience: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const dataToSend = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        email: formData.email,
      };

      if (formData.role === 'Student') {
        dataToSend.country = formData.country;
        dataToSend.category = formData.category;
        dataToSend.skill_level = formData.skill_level;
        dataToSend.age = parseInt(formData.age);
      } else if (formData.role === 'Instructor') {
        dataToSend.experience = parseInt(formData.experience) || 0;
      }

      await adminAPI.createUser(dataToSend);
      setMessage('User created successfully!');
      setTimeout(() => navigate('/admin'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-container">
      <h1>Create New User</h1>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
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
              <option value="Data_Analyst">Data Analyst</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
          </div>

          {formData.role === 'Student' && (
            <>
              <div className="form-group">
                <label htmlFor="country" className="form-label">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  className="form-control"
                  value={formData.country}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category</label>
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
                <label htmlFor="skill_level" className="form-label">Skill Level</label>
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
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className="form-control"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="16"
                />
              </div>
            </>
          )}

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
              />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function CreateCourse() {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    fees: '',
  });
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await adminAPI.getAllInstructors();
      setInstructors(response.data);
    } catch (err) {
      console.error('Error loading instructors:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInstructorToggle = (instructorId) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructorId)
        ? prev.filter((id) => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await adminAPI.createCourse({
        name: formData.name,
        duration: parseInt(formData.duration),
        fees: parseInt(formData.fees),
        instructors: selectedInstructors,
      });
      setMessage('Course created successfully!');
      setTimeout(() => navigate('/admin/courses'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error creating course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paper-container">
      <h1>Create New Course</h1>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Course Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="duration" className="form-label">Duration (weeks)</label>
            <input
              type="number"
              id="duration"
              name="duration"
              className="form-control"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fees" className="form-label">Fees ($)</label>
            <input
              type="number"
              id="fees"
              name="fees"
              className="form-control"
              value={formData.fees}
              onChange={handleChange}
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Assign Instructors</label>
          <div className="card" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div className="card-body">
              {instructors.length > 0 ? (
                instructors.map((instructor) => (
                  <div key={instructor.user_id} style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedInstructors.includes(instructor.user_id)}
                        onChange={() => handleInstructorToggle(instructor.user_id)}
                        style={{ marginRight: '8px' }}
                      />
                      <span>
                        {instructor.name} ({instructor.experience} years) - Teaching {instructor.courses_teaching} courses
                      </span>
                    </label>
                  </div>
                ))
              ) : (
                <p>No instructors available</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminDashboard() {
  return (
    <>
      <AdminNavbar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/courses" element={<CourseManagement />} />
        <Route path="/create-user" element={<CreateUser />} />
        <Route path="/create-course" element={<CreateCourse />} />
      </Routes>
    </>
  );
}

export default AdminDashboard;
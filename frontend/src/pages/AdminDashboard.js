import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminAPI } from '../services/api';
import { Users, BookOpen, Settings, LogOut, Globe, GraduationCap } from 'lucide-react';

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
      icon: <Globe size={48} />,
      title: 'Universities',
      description: 'Manage partner universities',
      path: '/admin/universities'
    },
    {
      icon: <GraduationCap size={48} />,
      title: 'Programs',
      description: 'Manage academic programs',
      path: '/admin/programs'
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
        <Link to="/admin/users" className="nav-link">Users</Link>
        <Link to="/admin/courses" className="nav-link">Courses</Link>
        <Link to="/admin/universities" className="nav-link">Universities</Link>
        <Link to="/admin/programs" className="nav-link">Programs</Link>
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '', password: '', role: 'Student', name: '', email: '',
    country: '', category: 'Undergraduate', skill_level: 'Beginner', age: '', experience: '',
  });
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      showToast('Error loading users', 'error');
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
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error deleting user', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await adminAPI.changePassword(selectedUser.user_id, newPassword);
      showToast('Password changed successfully', 'success');
      setSelectedUser(null);
      setNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Error changing password', 'error');
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const dataToSend = {
        username: createForm.username, password: createForm.password,
        role: createForm.role, name: createForm.name, email: createForm.email,
      };
      if (createForm.role === 'Student') {
        dataToSend.country = createForm.country;
        dataToSend.category = createForm.category;
        dataToSend.skill_level = createForm.skill_level;
        dataToSend.age = parseInt(createForm.age);
      } else if (createForm.role === 'Instructor') {
        dataToSend.experience = parseInt(createForm.experience) || 0;
      }
      await adminAPI.createUser(dataToSend);
      showToast('User created successfully!', 'success');
      setCreateForm({ username: '', password: '', role: 'Student', name: '', email: '', country: '', category: 'Undergraduate', skill_level: 'Beginner', age: '', experience: '' });
      setShowCreateForm(false);
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error creating user', 'error');
    } finally {
      setCreateLoading(false);
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
      <div className="flex-between mb-3">
        <h1>User Management</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-success">
          {showCreateForm ? 'Cancel' : '+ Create User'}
        </button>
      </div>

      {/* Inline Create User Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateUser} className="card mb-4">
          <div className="card-header"><h3 className="card-title">Create New User</h3></div>
          <div className="card-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Role</label>
                <select name="role" className="form-control" value={createForm.role} onChange={handleCreateChange} required>
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Data_Analyst">Data Analyst</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-control" value={createForm.name} onChange={handleCreateChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={createForm.email} onChange={handleCreateChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input type="text" name="username" className="form-control" value={createForm.username} onChange={handleCreateChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={createForm.password} onChange={handleCreateChange} required minLength="6" />
              </div>
              {createForm.role === 'Student' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input type="text" name="country" className="form-control" value={createForm.country} onChange={handleCreateChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select name="category" className="form-control" value={createForm.category} onChange={handleCreateChange} required>
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Skill Level</label>
                    <select name="skill_level" className="form-control" value={createForm.skill_level} onChange={handleCreateChange} required>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age</label>
                    <input type="number" name="age" className="form-control" value={createForm.age} onChange={handleCreateChange} required min="16" />
                  </div>
                </>
              )}
              {createForm.role === 'Instructor' && (
                <div className="form-group">
                  <label className="form-label">Years of Experience</label>
                  <input type="number" name="experience" className="form-control" value={createForm.experience} onChange={handleCreateChange} required min="0" />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary mt-2" disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
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
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', duration: '', fees: '', description: '' });
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await adminAPI.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      showToast('Error loading courses', 'error');
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
      showToast('Course deleted successfully', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error deleting course', 'error');
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await adminAPI.getAllInstructors();
      setInstructors(response.data);
    } catch (err) {
      console.error('Error loading instructors:', err);
    }
  };

  const handleCreateChange = (e) => {
    setCreateForm({ ...createForm, [e.target.name]: e.target.value });
  };

  const handleInstructorToggle = (instructorId) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructorId) ? prev.filter((id) => id !== instructorId) : [...prev, instructorId]
    );
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await adminAPI.createCourse({
        name: createForm.name,
        duration: parseInt(createForm.duration),
        fees: parseInt(createForm.fees),
        description: createForm.description,
        instructors: selectedInstructors,
      });
      showToast('Course created successfully!', 'success');
      setCreateForm({ name: '', duration: '', fees: '', description: '' });
      setSelectedInstructors([]);
      setShowCreateForm(false);
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error creating course', 'error');
    } finally {
      setCreateLoading(false);
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
      <div className="flex-between mb-3">
        <h1>Course Management</h1>
        <button onClick={() => { setShowCreateForm(!showCreateForm); if (!showCreateForm) fetchInstructors(); }} className="btn btn-success">
          {showCreateForm ? 'Cancel' : '+ Create Course'}
        </button>
      </div>

      {/* Inline Create Course Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateCourse} className="card mb-4">
          <div className="card-header"><h3 className="card-title">Create New Course</h3></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Course Name</label>
              <input type="text" name="name" className="form-control" value={createForm.name} onChange={handleCreateChange} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Duration (weeks)</label>
                <input type="number" name="duration" className="form-control" value={createForm.duration} onChange={handleCreateChange} required min="1" />
              </div>
              <div className="form-group">
                <label className="form-label">Fees ($)</label>
                <input type="number" name="fees" className="form-control" value={createForm.fees} onChange={handleCreateChange} required min="0" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description (optional, max 500 chars)</label>
              <textarea name="description" className="form-control" value={createForm.description} onChange={handleCreateChange} maxLength="500" rows="3" placeholder="Enter course description" style={{ resize: 'vertical' }} />
              <small style={{ color: 'var(--text-secondary)' }}>{createForm.description.length}/500</small>
            </div>
            <div className="form-group">
              <label className="form-label">Assign Instructors</label>
              <div className="card" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div className="card-body">
                  {instructors.length > 0 ? instructors.map((inst) => (
                    <div key={inst.user_id} style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={selectedInstructors.includes(inst.user_id)} onChange={() => handleInstructorToggle(inst.user_id)} style={{ marginRight: '8px' }} />
                        <span>{inst.name} ({inst.experience} years) - Teaching {inst.courses_teaching} courses</span>
                      </label>
                    </div>
                  )) : <p>No instructors available</p>}
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={createLoading}>
              {createLoading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
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
                onClick={() => navigate(`/admin/courses/${course.course_id}`)}
                className="btn btn-primary btn-sm"
              >
                Manage
              </button>
              <button
                onClick={() => handleDeleteCourse(course.course_id, course.name)}
                className="btn btn-danger btn-sm"
              >
                Delete
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

function CourseDetail() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allInstructors, setAllInstructors] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showAddInstructor, setShowAddInstructor] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const navigate = useNavigate();
  const courseId = window.location.pathname.split('/').pop();
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await adminAPI.getCourseDetails(courseId);
      setCourse(response.data);
    } catch (err) {
      showToast('Error loading course details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllInstructors = async () => {
    try {
      const response = await adminAPI.getAllInstructors();
      setAllInstructors(response.data);
      setShowAddInstructor(true);
    } catch (err) {
      showToast('Error loading instructors', 'error');
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await adminAPI.getAllStudents();
      setAllStudents(response.data);
      setShowAddStudent(true);
    } catch (err) {
      showToast('Error loading students', 'error');
    }
  };

  const handleAssignInstructor = async (instructorId) => {
    try {
      await adminAPI.assignInstructor(courseId, instructorId);
      showToast('Instructor assigned successfully', 'success');
      setShowAddInstructor(false);
      fetchCourseDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error assigning instructor', 'error');
    }
  };

  const handleRemoveInstructor = async (instructorId) => {
    if (!window.confirm('Remove this instructor from the course?')) return;
    try {
      await adminAPI.removeInstructor(courseId, instructorId);
      showToast('Instructor removed', 'success');
      fetchCourseDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error removing instructor', 'error');
    }
  };

  const handleEnrollStudent = async (studentId) => {
    try {
      await adminAPI.enrollStudent(courseId, studentId);
      showToast('Student enrolled successfully', 'success');
      setShowAddStudent(false);
      fetchCourseDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error enrolling student', 'error');
    }
  };

  const handleUnenrollStudent = async (studentId) => {
    if (!window.confirm('Remove this student from the course?')) return;
    try {
      await adminAPI.unenrollStudent(courseId, studentId);
      showToast('Student removed', 'success');
      fetchCourseDetails();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error removing student', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="paper-container">
        <h1>Course Not Found</h1>
        <button onClick={() => navigate('/admin/courses')} className="btn">Back</button>
      </div>
    );
  }

  const assignedInstructorIds = (course.instructors || []).map(i => i.user_id);
  const enrolledStudentIds = (course.students || []).map(s => s.user_id);

  return (
    <div className="paper-container">
      <button onClick={() => navigate('/admin/courses')} className="btn btn-sm mb-3">
        ← Back to Courses
      </button>

      <h1>{course.name}</h1>
      <p className="mb-4">
        <strong>ID:</strong> {course.course_id} | <strong>Duration:</strong> {course.duration} weeks | <strong>Fees:</strong> ${course.fees}
      </p>
      {course.description && (
        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '16px' }}>{course.description}</p>
      )}

      {/* Instructors Section */}
      <div className="card mb-4">
        <div className="card-header flex-between">
          <h3 className="card-title">Instructors ({course.instructors?.length || 0})</h3>
          <button onClick={fetchAllInstructors} className="btn btn-sm btn-success">+ Add Instructor</button>
        </div>
        <div className="card-body">
          {course.instructors && course.instructors.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Experience</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.instructors.map((inst) => (
                    <tr key={inst.user_id}>
                      <td><code>{inst.user_id}</code></td>
                      <td>{inst.name}</td>
                      <td>{inst.email}</td>
                      <td>{inst.experience} years</td>
                      <td>
                        <button onClick={() => handleRemoveInstructor(inst.user_id)} className="btn btn-sm btn-danger">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No instructors assigned yet.</p>
          )}

          {showAddInstructor && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4>Select Instructor to Add:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {allInstructors
                  .filter(i => !assignedInstructorIds.includes(i.user_id))
                  .map(inst => (
                    <div key={inst.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                      <span>{inst.name} ({inst.experience} yrs exp, {inst.courses_teaching} courses)</span>
                      <button onClick={() => handleAssignInstructor(inst.user_id)} className="btn btn-sm btn-primary">Add</button>
                    </div>
                  ))}
                {allInstructors.filter(i => !assignedInstructorIds.includes(i.user_id)).length === 0 && (
                  <p>All instructors are already assigned.</p>
                )}
              </div>
              <button onClick={() => setShowAddInstructor(false)} className="btn btn-sm mt-2">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Students Section */}
      <div className="card mb-4">
        <div className="card-header flex-between">
          <h3 className="card-title">Enrolled Students ({course.students?.length || 0})</h3>
          <button onClick={fetchAllStudents} className="btn btn-sm btn-success">+ Add Student</button>
        </div>
        <div className="card-body">
          {course.students && course.students.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Skill</th>
                    <th>Score</th>
                    <th>Enrolled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map((stu) => (
                    <tr key={stu.user_id}>
                      <td><code>{stu.user_id}</code></td>
                      <td>{stu.name}</td>
                      <td>{stu.email}</td>
                      <td>{stu.country}</td>
                      <td><span className="badge">{stu.skill_level}</span></td>
                      <td>{stu.score !== null ? stu.score : 'N/A'}</td>
                      <td>{stu.enrollment_date ? new Date(stu.enrollment_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button onClick={() => handleUnenrollStudent(stu.user_id)} className="btn btn-sm btn-danger">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No students enrolled yet.</p>
          )}

          {showAddStudent && (
            <div style={{ marginTop: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <h4>Select Student to Enroll:</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {allStudents
                  .filter(s => !enrolledStudentIds.includes(s.user_id))
                  .map(stu => (
                    <div key={stu.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                      <span>{stu.name} ({stu.country}, {stu.skill_level})</span>
                      <button onClick={() => handleEnrollStudent(stu.user_id)} className="btn btn-sm btn-primary">Enroll</button>
                    </div>
                  ))}
                {allStudents.filter(s => !enrolledStudentIds.includes(s.user_id)).length === 0 && (
                  <p>All students are already enrolled.</p>
                )}
              </div>
              <button onClick={() => setShowAddStudent(false)} className="btn btn-sm mt-2">Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      {course.content && course.content.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Course Content ({course.content.length})</h3>
          </div>
          <div className="card-body">
            {course.content.map((item) => (
              <div key={item.content_id} style={{ padding: '8px', marginBottom: '8px', background: 'var(--bg-secondary)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-info" style={{ marginRight: '8px' }}>{item.type}</span>
                  <span style={{ fontSize: '0.9rem' }}>{item.url}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UniversityManagement() {
  const [universities, setUniversities] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingCourseFor, setAddingCourseFor] = useState(null);
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [uniRes, courseRes] = await Promise.all([
        adminAPI.getAllUniversities(),
        adminAPI.getAllCourses()
      ]);
      setUniversities(uniRes.data);
      setAllCourses(courseRes.data);
    } catch (err) {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createUniversity({ name: newName });
      showToast('University created successfully', 'success');
      setNewName('');
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error creating university', 'error');
    }
  };

  const handleDeleteUniversity = async (id, name) => {
    if (!window.confirm(`Delete university: ${name}?`)) return;
    try {
      await adminAPI.deleteUniversity(id);
      showToast('University deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error deleting university', 'error');
    }
  };

  const handleAssignCourse = async (universityId, courseId) => {
    try {
      await adminAPI.assignCourseToUniversity(universityId, courseId);
      showToast('Course assigned to university', 'success');
      setAddingCourseFor(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error assigning course', 'error');
    }
  };

  const handleRemoveCourse = async (universityId, courseId) => {
    try {
      await adminAPI.removeCourseFromUniversity(universityId, courseId);
      showToast('Course removed from university', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error removing course', 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="paper-container">
      <div className="flex-between mb-3">
        <h1>Partner Universities</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-success">
          {showCreateForm ? 'Cancel' : '+ Add University'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateUniversity} className="card mb-4">
          <div className="card-body">
            <div className="flex gap-2">
              <input type="text" className="form-control" placeholder="University name" value={newName} onChange={(e) => setNewName(e.target.value)} required style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </div>
        </form>
      )}

      {universities.map((uni) => (
        <div key={uni.university_id} className="card mb-4">
          <div className="card-header flex-between">
            <div>
              <h3 className="card-title">{uni.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{uni.university_id} · {uni.course_count} courses</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setAddingCourseFor(addingCourseFor === uni.university_id ? null : uni.university_id)} className="btn btn-sm">+ Add Course</button>
              <button onClick={() => handleDeleteUniversity(uni.university_id, uni.name)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
          <div className="card-body">
            {uni.courses && uni.courses.length > 0 ? (
              <div>
                {uni.courses.map((c) => (
                  <div key={c.course_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>{c.name} ({c.course_id})</span>
                    <button onClick={() => handleRemoveCourse(uni.university_id, c.course_id)} className="btn btn-sm btn-danger">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No courses offered yet.</p>
            )}

            {addingCourseFor === uni.university_id && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4>Select Course:</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {allCourses
                    .filter(c => !(uni.courses || []).some(uc => uc.course_id === c.course_id))
                    .map(c => (
                      <div key={c.course_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span>{c.name}</span>
                        <button onClick={() => handleAssignCourse(uni.university_id, c.course_id)} className="btn btn-sm btn-primary">Add</button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {universities.length === 0 && <div className="alert alert-info">No partner universities yet.</div>}
    </div>
  );
}

function ProgramManagement() {
  const [programs, setPrograms] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', prog_type: 'Certificate', duration: '' });
  const [addingCourseFor, setAddingCourseFor] = useState(null);
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [progRes, courseRes] = await Promise.all([
        adminAPI.getAllPrograms(),
        adminAPI.getAllCourses()
      ]);
      setPrograms(progRes.data);
      setAllCourses(courseRes.data);
    } catch (err) {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createProgram({
        name: formData.name,
        prog_type: formData.prog_type,
        duration: parseInt(formData.duration)
      });
      showToast('Program created successfully', 'success');
      setFormData({ name: '', prog_type: 'Certificate', duration: '' });
      setShowCreateForm(false);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error creating program', 'error');
    }
  };

  const handleDeleteProgram = async (id, name) => {
    if (!window.confirm(`Delete program: ${name}?`)) return;
    try {
      await adminAPI.deleteProgram(id);
      showToast('Program deleted', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error deleting program', 'error');
    }
  };

  const handleAddCourse = async (programId, courseId) => {
    try {
      await adminAPI.addCourseToProgram(programId, courseId);
      showToast('Course added to program', 'success');
      setAddingCourseFor(null);
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error adding course', 'error');
    }
  };

  const handleRemoveCourse = async (programId, courseId) => {
    try {
      await adminAPI.removeCourseFromProgram(programId, courseId);
      showToast('Course removed from program', 'success');
      fetchData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error removing course', 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div><p>Loading...</p></div>;

  return (
    <div className="paper-container">
      <div className="flex-between mb-3">
        <h1>Program Management</h1>
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn btn-success">
          {showCreateForm ? 'Cancel' : '+ Create Program'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateProgram} className="card mb-4">
          <div className="card-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Program Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={formData.prog_type} onChange={(e) => setFormData({...formData, prog_type: e.target.value})}>
                  <option value="Certificate">Certificate</option>
                  <option value="Bootcamp">Bootcamp</option>
                  <option value="Degree">Degree</option>
                  <option value="Specialization">Specialization</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (months)</label>
                <input type="number" className="form-control" min="1" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} required />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">Create Program</button>
              </div>
            </div>
          </div>
        </form>
      )}

      {programs.map((prog) => (
        <div key={prog.program_id} className="card mb-4">
          <div className="card-header flex-between">
            <div>
              <h3 className="card-title">{prog.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {prog.program_id} · {prog.prog_type} · {prog.duration} months · {prog.course_count} courses
              </p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setAddingCourseFor(addingCourseFor === prog.program_id ? null : prog.program_id)} className="btn btn-sm">+ Add Course</button>
              <button onClick={() => handleDeleteProgram(prog.program_id, prog.name)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          </div>
          <div className="card-body">
            {prog.courses && prog.courses.length > 0 ? (
              <div>
                {prog.courses.map((c) => (
                  <div key={c.course_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-glass)' }}>
                    <span>{c.name} ({c.course_id}) · {c.duration} weeks · ${c.fees}</span>
                    <button onClick={() => handleRemoveCourse(prog.program_id, c.course_id)} className="btn btn-sm btn-danger">Remove</button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>No courses in this program.</p>
            )}

            {addingCourseFor === prog.program_id && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <h4>Select Course:</h4>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {allCourses
                    .filter(c => !(prog.courses || []).some(pc => pc.course_id === c.course_id))
                    .map(c => (
                      <div key={c.course_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                        <span>{c.name}</span>
                        <button onClick={() => handleAddCourse(prog.program_id, c.course_id)} className="btn btn-sm btn-primary">Add</button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {programs.length === 0 && <div className="alert alert-info">No programs yet.</div>}
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
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/universities" element={<UniversityManagement />} />
        <Route path="/programs" element={<ProgramManagement />} />
      </Routes>
    </>
  );
}

export default AdminDashboard;
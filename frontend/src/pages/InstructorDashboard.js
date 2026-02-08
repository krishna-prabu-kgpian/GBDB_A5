import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { instructorAPI } from '../services/api';
import { BookOpen, Globe, PlusCircle, LogOut } from 'lucide-react';

function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardItems = [
    {
      icon: <BookOpen size={48} />,
      title: 'My Courses',
      description: 'View and manage courses you teach',
      path: '/instructor/my-courses'
    },
    {
      icon: <Globe size={48} />,
      title: 'All Courses',
      description: 'Browse all available courses',
      path: '/instructor/all-courses'
    },
    {
      icon: <PlusCircle size={48} />,
      title: 'Create Course',
      description: 'Create a new course',
      path: '/instructor/create-course'
    }
  ];

  return (
    <div className="paper-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user?.name}!</h1>
        <p className="welcome-subtitle">Manage your teaching activities</p>
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

function InstructorNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/instructor" className="navbar-brand">
        <BookOpen size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Educational Platform
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

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await instructorAPI.getMyCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <h1>My Courses</h1>
      <p className="mb-4">Courses you are teaching</p>

      <div className="grid">
        {courses.map((course) => (
          <div key={course.course_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{course.name}</h3>
            </div>
            <div className="card-body">
              <p><strong>Duration:</strong> {course.duration} weeks</p>
              <p><strong>Fees:</strong> ${course.fees}</p>
              <p><strong>Enrolled Students:</strong> {course.enrolled_students || 0}</p>
            </div>
            <div className="card-footer">
              <button
                onClick={() => navigate(`/instructor/course/${course.course_id}`)}
                className="btn btn-primary btn-sm"
              >
                Manage Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="alert alert-info">
          You are not teaching any courses yet. <Link to="/instructor/create-course">Create a course</Link>
        </div>
      )}
    </div>
  );
}

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const fetchAllCourses = async () => {
    try {
      const response = await instructorAPI.getAllCourses();
      setCourses(response.data);
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <h1>All Courses</h1>
      <p className="mb-4">All courses in the platform</p>

      <div className="grid">
        {courses.map((course) => (
          <div key={course.course_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{course.name}</h3>
              {course.is_teaching && (
                <span className="badge badge-success">Teaching</span>
              )}
            </div>
            <div className="card-body">
              <p><strong>Duration:</strong> {course.duration} weeks</p>
              <p><strong>Fees:</strong> ${course.fees}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CreateCourse() {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    fees: '',
  });
  const [collaborators, setCollaborators] = useState([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await instructorAPI.getAllInstructors();
      setCollaborators(response.data);
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

  const handleCollaboratorToggle = (instructorId) => {
    setSelectedCollaborators((prev) =>
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
      const dataToSend = {
        name: formData.name,
        duration: parseInt(formData.duration),
        fees: parseInt(formData.fees),
        collaborators: selectedCollaborators,
      };

      await instructorAPI.createCourse(dataToSend);
      setMessage('Course created successfully!');
      setTimeout(() => navigate('/instructor'), 2000);
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
          <label htmlFor="name" className="form-label">
            Course Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-control"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter course name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration" className="form-label">
            Duration (weeks)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            className="form-control"
            value={formData.duration}
            onChange={handleChange}
            required
            min="1"
            placeholder="Enter duration in weeks"
          />
        </div>

        <div className="form-group">
          <label htmlFor="fees" className="form-label">
            Fees ($)
          </label>
          <input
            type="number"
            id="fees"
            name="fees"
            className="form-control"
            value={formData.fees}
            onChange={handleChange}
            required
            min="0"
            placeholder="Enter course fees"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Collaborating Instructors (Optional)
          </label>
          <div className="card" style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <div className="card-body">
              {collaborators.length > 0 ? (
                collaborators.map((instructor) => (
                  <div key={instructor.user_id} style={{ marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedCollaborators.includes(instructor.user_id)}
                        onChange={() => handleCollaboratorToggle(instructor.user_id)}
                        style={{ marginRight: '8px' }}
                      />
                      <span>{instructor.name} ({instructor.experience} years experience)</span>
                    </label>
                  </div>
                ))
              ) : (
                <p>No other instructors available</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/instructor')}
            className="btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function CourseManagement() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    fees: '',
  });
  const [contentForm, setContentForm] = useState({
    url: '',
    type: 'Video',
  });
  const [showContentForm, setShowContentForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const navigate = useNavigate();
  const courseId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await instructorAPI.getCourseDetails(courseId);
      setCourse(response.data);
      setFormData({
        name: response.data.name,
        duration: response.data.duration,
        fees: response.data.fees,
      });
    } catch (err) {
      console.error('Error loading course:', err);
      if (err.response?.status === 403) {
        setMessage('You do not have permission to manage this course');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContentChange = (e) => {
    setContentForm({
      ...contentForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await instructorAPI.updateCourse(courseId, {
        name: formData.name,
        duration: parseInt(formData.duration),
        fees: parseInt(formData.fees),
      });
      setMessage('Course updated successfully!');
      setEditMode(false);
      fetchCourseDetails();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error updating course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await instructorAPI.addContent(courseId, contentForm);
      setMessage('Content added successfully!');
      setContentForm({ url: '', type: 'Video' });
      setShowContentForm(false);
      fetchCourseDetails();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error adding content');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !course) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="paper-container">
        <h1>Course Not Found</h1>
        <button onClick={() => navigate('/instructor')} className="btn">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <button onClick={() => navigate('/instructor')} className="btn btn-sm mb-3">
        ← Back to My Courses
      </button>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="grid-2 mb-4">
        {/* Course Information - Compact */}
        <div>
          <h1 style={{ marginBottom: '16px' }}>{course.name}</h1>
          {editMode ? (
            <form onSubmit={handleUpdate}>
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
              <div className="flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
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
                <div className="form-group" style={{ flex: 1 }}>
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
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>Save</button>
                <button type="button" onClick={() => setEditMode(false)} className="btn btn-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <div>
              <p><strong>Duration:</strong> {course.duration} weeks | <strong>Fees:</strong> ${course.fees}</p>
              <p><strong>Enrolled Students:</strong> {course.students?.length || 0}</p>
              {course.instructors && course.instructors.length > 0 && (
                <p><strong>Co-Instructors:</strong> {course.instructors.map(i => i.name).join(', ')}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setEditMode(true)} className="btn btn-sm">Edit Course</button>
                <button onClick={() => setShowStudents(!showStudents)} className="btn btn-sm">
                  {showStudents ? 'Hide' : 'Show'} Students
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Course Content - Main Focus */}
        <div>
          <div className="flex-between mb-2">
            <h3>Course Content</h3>
            <button
              onClick={() => setShowContentForm(!showContentForm)}
              className="btn btn-sm btn-success"
            >
              {showContentForm ? 'Cancel' : '+ Add'}
            </button>
          </div>

          {showContentForm && (
            <form onSubmit={handleAddContent} className="mb-3" style={{ padding: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <div className="flex gap-2">
                <select
                  name="type"
                  className="form-control"
                  value={contentForm.type}
                  onChange={handleContentChange}
                  style={{ flex: '0 0 140px' }}
                  required
                >
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Lab">Lab</option>
                </select>
                <input
                  type="url"
                  name="url"
                  className="form-control"
                  value={contentForm.url}
                  onChange={handleContentChange}
                  required
                  placeholder="Enter content URL"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>Add</button>
              </div>
            </form>
          )}

          {course.content && course.content.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {course.content.map((item, index) => (
                <div key={item.content_id} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  background: 'var(--bg-secondary)', 
                  border: '1px solid var(--border-glass)', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <span className="badge badge-info" style={{ marginRight: '8px' }}>{item.type}</span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {item.url.length > 50 ? item.url.substring(0, 50) + '...' : item.url}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                  >
                    Open
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No content added yet. Add videos, documents, quizzes, assignments, and lab materials here.</p>
          )}
        </div>
      </div>

      {/* Students Table - Collapsible */}
      {showStudents && course.students && course.students.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Enrolled Students</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Skill Level</th>
                    <th>Score</th>
                    <th>Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map((student, index) => (
                    <tr key={index}>
                      <td>{student.name}</td>
                      <td>{student.country}</td>
                      <td><span className="badge">{student.skill_level}</span></td>
                      <td>{student.score !== null ? student.score : 'In Progress'}</td>
                      <td>{new Date(student.enrollment_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InstructorDashboard() {
  return (
    <>
      <InstructorNavbar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/all-courses" element={<AllCourses />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/course/:courseId" element={<CourseManagement />} />
      </Routes>
    </>
  );
}

export default InstructorDashboard;
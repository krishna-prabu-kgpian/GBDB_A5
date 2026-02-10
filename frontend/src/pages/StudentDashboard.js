import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { studentAPI } from '../services/api';
import { BookOpen, GraduationCap, LogOut } from 'lucide-react';

function DashboardOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboardItems = [
    {
      icon: <BookOpen size={48} />,
      title: 'Programs',
      description: 'Browse programs and their courses',
      path: '/student/programs'
    },
    {
      icon: <BookOpen size={48} />,
      title: 'All Courses',
      description: 'Browse and enroll in available courses',
      path: '/student/all-courses'
    },
    {
      icon: <GraduationCap size={48} />,
      title: 'My Courses',
      description: 'View courses you are enrolled in',
      path: '/student/my-courses'
    }
  ];

  return (
    <div className="paper-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user?.name}!</h1>
        <p className="welcome-subtitle">What would you like to do today?</p>
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

function StudentNavbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/student" className="navbar-brand">
        <BookOpen size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
        Educational Platform
      </Link>
      <div className="navbar-nav">
        <Link to="/student/programs" className="nav-link">Programs</Link>
        <Link to="/student/all-courses" className="nav-link">All Courses</Link>
        <Link to="/student/my-courses" className="nav-link">My Courses</Link>
        <button onClick={handleLogout} className="btn btn-sm btn-danger">
          <LogOut size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Logout
        </button>
      </div>
    </nav>
  );
}

function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (search = '') => {
    try {
      const response = await studentAPI.getAllCourses(search);
      setCourses(response.data);
    } catch (err) {
      showToast('Error loading courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchCourses(searchTerm);
  };

  const handleEnroll = async (courseId) => {
    try {
      await studentAPI.enrollCourse(courseId);
      showToast('Successfully enrolled!', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error enrolling in course', 'error');
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    
    try {
      await studentAPI.unenrollCourse(courseId);
      showToast('Successfully unenrolled', 'success');
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error unenrolling from course', 'error');
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
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="card mb-4">
        <div className="card-body">
          <div className="flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search courses by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary">Search</button>
            {searchTerm && (
              <button type="button" onClick={() => { setSearchTerm(''); setLoading(true); fetchCourses(''); }} className="btn">Clear</button>
            )}
          </div>
        </div>
      </form>

      <div className="grid">
        {courses.map((course) => (
          <div key={course.course_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{course.name}</h3>
              {course.is_enrolled && (
                <span className="badge badge-success">Enrolled</span>
              )}
            </div>
            <div className="card-body">
              <p><strong>Duration:</strong> {course.duration} weeks</p>
              <p><strong>Fees:</strong> ${course.fees}</p>
              {course.description && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{course.description.length > 100 ? course.description.substring(0, 100) + '...' : course.description}</p>
              )}
            </div>
            <div className="card-footer">
              <button
                onClick={() => navigate(`/student/course/${course.course_id}`)}
                className="btn btn-primary btn-sm"
              >
                View Details
              </button>
              {course.is_enrolled ? (
                <button
                  onClick={() => handleUnenroll(course.course_id)}
                  className="btn btn-danger btn-sm"
                >
                  Unenroll
                </button>
              ) : (
                <button
                  onClick={() => handleEnroll(course.course_id)}
                  className="btn btn-success btn-sm"
                >
                  Enroll Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
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
      const response = await studentAPI.getMyCourses();
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

  if (courses.length === 0) {
    return (
      <div className="paper-container">
        <h1>My Courses</h1>
        <div className="alert alert-info">
          You are not enrolled in any courses yet. <Link to="/student">Browse courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <h1>My Courses</h1>
      <div className="grid">
        {courses.map((course) => (
          <div key={course.course_id} className="card">
            <div className="card-header">
              <h3 className="card-title">{course.name}</h3>
              {course.score !== null && (
                <span className="badge badge-info">Score: {course.score}</span>
              )}
            </div>
            <div className="card-body">
              <p><strong>Duration:</strong> {course.duration} weeks</p>
              <p><strong>Enrolled:</strong> {new Date(course.enrollment_date).toLocaleDateString()}</p>
              {course.score !== null ? (
                <p><strong>Status:</strong> Completed</p>
              ) : (
                <p><strong>Status:</strong> In Progress</p>
              )}
            </div>
            <div className="card-footer">
              <button
                onClick={() => navigate(`/student/course/${course.course_id}`)}
                className="btn btn-primary btn-sm"
              >
                View Course
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDetails() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInstructors, setShowInstructors] = useState(false);
  const [showTextbooks, setShowTextbooks] = useState(false);
  const navigate = useNavigate();
  const courseId = window.location.pathname.split('/').pop();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await studentAPI.getCourseDetails(courseId);
      setCourse(response.data);
    } catch (err) {
      console.error('Error loading course details:', err);
    } finally {
      setLoading(false);
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
        <button onClick={() => navigate('/student')} className="btn">
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <button onClick={() => navigate('/student')} className="btn btn-sm mb-3">
        ← Back to Courses
      </button>

      {course.is_enrolled && (
        <div className="alert alert-success mb-3">
          You are enrolled in this course
          {course.my_score !== null && ` - Your Score: ${course.my_score}`}
        </div>
      )}

      <div className="grid-2 mb-4">
        {/* Course Information - Compact */}
        <div>
          <h1 style={{ marginBottom: '16px' }}>{course.name}</h1>
          <p><strong>Duration:</strong> {course.duration} weeks | <strong>Fees:</strong> ${course.fees}</p>
          {course.description && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>{course.description}</p>
          )}
          {course.enrollment_date && (
            <p><strong>Enrolled On:</strong> {new Date(course.enrollment_date).toLocaleDateString()}</p>
          )}
          
          {course.topics && course.topics.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <strong>Topics:</strong>
              <div className="flex gap-2" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
                {course.topics.map((topic) => (
                  <span key={topic.topic_id} className="badge">
                    {topic.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {course.instructors && course.instructors.length > 0 && (
              <button onClick={() => setShowInstructors(!showInstructors)} className="btn btn-sm">
                {showInstructors ? 'Hide' : 'Show'} Instructors
              </button>
            )}
            {course.textbooks && course.textbooks.length > 0 && (
              <button onClick={() => setShowTextbooks(!showTextbooks)} className="btn btn-sm">
                {showTextbooks ? 'Hide' : 'Show'} Textbooks
              </button>
            )}
          </div>

          {showInstructors && course.instructors && course.instructors.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <strong>Instructors:</strong>
              {course.instructors.map((instructor, index) => (
                <div key={index} style={{ marginTop: '8px' }}>
                  <p>{instructor.name} - {instructor.experience} years experience</p>
                </div>
              ))}
            </div>
          )}

          {showTextbooks && course.textbooks && course.textbooks.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
              <strong>Textbooks:</strong>
              {course.textbooks.map((book) => (
                <div key={book.isbn} style={{ marginTop: '8px' }}>
                  <p><strong>{book.title}</strong> by {book.author}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ISBN: {book.isbn}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Content - Main Focus */}
        <div>
          <h3>Course Content</h3>
          {course.content && course.content.length > 0 ? (
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
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
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No content available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const navigate = useNavigate();
  const { showToast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await studentAPI.getPrograms();
      setPrograms(response.data);
      // Expand all programs by default
      const expanded = {};
      response.data.forEach(program => {
        expanded[program.program_id] = true;
      });
      setExpandedPrograms(expanded);
    } catch (err) {
      showToast('Error loading programs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleProgram = (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const handleEnroll = async (courseId) => {
    try {
      await studentAPI.enrollCourse(courseId);
      showToast('Successfully enrolled!', 'success');
      fetchPrograms();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error enrolling in course', 'error');
    }
  };

  const handleUnenroll = async (courseId) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) {
      return;
    }
    
    try {
      await studentAPI.unenrollCourse(courseId);
      showToast('Successfully unenrolled', 'success');
      fetchPrograms();
    } catch (err) {
      showToast(err.response?.data?.error || 'Error unenrolling from course', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading programs...</p>
      </div>
    );
  }

  return (
    <div className="paper-container">
      <h1>Programs</h1>
      <p className="mb-4">Browse programs and enroll in courses</p>

      {programs.length === 0 ? (
        <div className="alert alert-info">No programs available at the moment.</div>
      ) : (
        <div>
          {programs.map((program) => (
            <div key={program.program_id} className="card mb-4">
              <div 
                className="card-header flex-between"
                style={{ cursor: 'pointer' }}
                onClick={() => toggleProgram(program.program_id)}
              >
                <div>
                  <h3 className="card-title">{program.name}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    <strong>Type:</strong> {program.prog_type} | <strong>Duration:</strong> {program.duration} months
                  </p>
                </div>
                <span style={{ fontSize: '1.5rem' }}>
                  {expandedPrograms[program.program_id] ? '−' : '+'}
                </span>
              </div>
              
              {expandedPrograms[program.program_id] && (
                <div className="card-body">
                  {program.courses && program.courses.length > 0 ? (
                    <div className="grid">
                      {program.courses.map((course) => (
                        <div key={course.course_id} style={{ 
                          padding: '16px', 
                          background: 'var(--bg-primary)', 
                          border: '1px solid var(--border-glass)', 
                          borderRadius: '8px' 
                        }}>
                          <div className="flex-between mb-2">
                            <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{course.name}</h4>
                            {course.is_enrolled && (
                              <span className="badge badge-success">Enrolled</span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            <strong>Duration:</strong> {course.duration} weeks | <strong>Fees:</strong> ${course.fees}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/student/course/${course.course_id}`)}
                              className="btn btn-primary btn-sm"
                            >
                              View Details
                            </button>
                            {course.is_enrolled ? (
                              <button
                                onClick={() => handleUnenroll(course.course_id)}
                                className="btn btn-danger btn-sm"
                              >
                                Unenroll
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEnroll(course.course_id)}
                                className="btn btn-success btn-sm"
                              >
                                Enroll Now
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No courses in this program yet.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentDashboard() {
  return (
    <>
      <StudentNavbar />
      <Routes>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/all-courses" element={<AllCourses />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
      </Routes>
    </>
  );
}

export default StudentDashboard;
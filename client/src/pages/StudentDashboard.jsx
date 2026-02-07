import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        fetchCourses();
        fetchMyCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await api.get(`/student/courses?search=${searchTerm}`);
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMyCourses = async () => {
        try {
            const res = await api.get(`/student/my-courses/${user.user_id}`);
            setMyCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const closeModal = () => {
        setModalInfo({ ...modalInfo, show: false });
    };

    return (
        <div className="detail-page fade-in">
            <Modal
                show={modalInfo.show}
                onClose={closeModal}
                title={modalInfo.title}
            >
                <p>{modalInfo.message}</p>
            </Modal>

            <div className="nav-header">
                <div>
                    <h1>Student Dashboard</h1>
                    <p className="sub-text">Welcome back, {user.name}!</p>
                </div>
                <button onClick={logout} className="btn-primary" style={{ backgroundColor: '#ef4444' }}>Logout</button>
            </div>

            <section className="dashboard-section">
                <h2>My Enrolled Courses</h2>
                {myCourses.length > 0 ? (
                    <div className="course-grid">
                        {myCourses.map(c => (
                            <div key={c.course_id} className="course-card" onClick={() => navigate(`/courses/${c.course_id}`)}>
                                <h3>{c.name}</h3>
                                <div className="detail-meta">
                                    <span className="badge">Enrolled</span>
                                    {c.score !== null && <span className="badge price">Score: {c.score}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p>You haven't enrolled in any courses yet.</p>}
            </section>

            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e5e7eb' }} />

            <section className="dashboard-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Available Courses</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={fetchCourses} className="btn-primary">Search</button>
                </div>

                <div className="course-grid">
                    {courses.filter(c => !myCourses.some(mc => mc.course_id === c.course_id)).map(c => (
                        <div key={c.course_id} className="course-card" onClick={() => navigate(`/courses/${c.course_id}`)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <h3>{c.name}</h3>
                                <span className="badge price">${c.fees}</span>
                            </div>
                            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Duration: {c.duration} weeks</p>
                            <button className="btn-primary full-width" style={{ marginTop: '10px' }}>View Details</button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default StudentDashboard;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const InstructorDashboard = () => {
    const { user, logout } = useAuth();
    const [myCourses, setMyCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [contentUrl, setContentUrl] = useState('');
    const [contentType, setContentType] = useState('Video');
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const res = await api.get(`/instructor/my-courses/${user.user_id}`);
            setMyCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddContent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/instructor/add-content', {
                course_id: selectedCourse,
                url: contentUrl,
                type: contentType
            });
            setModalInfo({ show: true, title: 'Success', message: 'Content added successfully' });
            setContentUrl('');
        } catch (err) {
            setModalInfo({ show: true, title: 'Error', message: 'Failed to add content' });
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
                onConfirm={modalInfo.onConfirm}
            >
                {modalInfo.isForm ? (
                    <form onSubmit={handleAddContent}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Content URL/Text: </label>
                            <input
                                type="text"
                                value={contentUrl}
                                onChange={(e) => setContentUrl(e.target.value)}
                                required
                                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Type: </label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value)}
                                style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                            >
                                <option value="Video">Video</option>
                                <option value="PDF">PDF</option>
                                <option value="Assignment">Assignment</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">Add Content</button>
                        </div>
                    </form>
                ) : (
                    <p>{modalInfo.message}</p>
                )}
            </Modal>

            <div className="nav-header">
                <div>
                    <h1>Instructor Dashboard</h1>
                    <p className="sub-text">Welcome back, {user.name}!</p>
                </div>
                <button onClick={logout} className="btn-primary" style={{ backgroundColor: '#ef4444' }}>Logout</button>
            </div>

            <section className="dashboard-section">
                <h2>My Courses</h2>
                {myCourses.length > 0 ? (
                    <div className="course-grid">
                        {myCourses.map(c => (
                            <div key={c.course_id} className="course-card">
                                <div style={{ marginBottom: '15px' }}>
                                    <h3>{c.name}</h3>
                                    <p className="sub-text">Course ID: {c.course_id}</p>
                                </div>
                                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                                    <button
                                        className="btn-primary full-width"
                                        onClick={() => {
                                            setSelectedCourse(c.course_id);
                                            setModalInfo({
                                                show: true,
                                                title: `Add Content to ${c.name}`,
                                                isForm: true
                                            });
                                        }}
                                    >
                                        Manage Content
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You are not assigned to any courses yet.</p>
                )}
            </section>
        </div>
    );
};

export default InstructorDashboard;

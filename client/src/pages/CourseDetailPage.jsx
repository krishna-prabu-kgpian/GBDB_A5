import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await api.get(`/student/courses/${courseId}`);
                setCourseData(res.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load course details.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [courseId]);

    const handleEnroll = async () => {
        try {
            await api.post('/student/enroll', { student_id: user.user_id, course_id: courseId });
            setModalInfo({ show: true, title: 'Success', message: 'Enrolled successfully!' });
        } catch (err) {
            setModalInfo({
                show: true,
                title: 'Error',
                message: err.response?.data?.error || 'Enrollment failed'
            });
        }
    };

    const closeModal = () => {
        setModalInfo({ ...modalInfo, show: false });
        if (modalInfo.title === 'Success') {
            // Optional: redirect or refresh?
        }
    };

    if (loading) return <div className="loading">Loading course details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!courseData || !courseData.course) return <div className="error">Course not found</div>;

    const { course, instructors, topics, content, textbooks } = courseData;

    return (
        <div className="course-detail-page fade-in">
            <Modal
                show={modalInfo.show}
                onClose={closeModal}
                title={modalInfo.title}
            >
                <p>{modalInfo.message}</p>
            </Modal>

            <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

            <div className="detail-header">
                <h1>{course.name}</h1>
                <div className="detail-meta">
                    <span className="badge">{course.duration} Weeks</span>
                    {/* Fees hidden per user request */}
                </div>
            </div>

            <div className="detail-grid">
                <div className="main-content cards">
                    <section className="detail-section card">
                        <h2>Description</h2>
                        <p>This comprehensive course covers everything you need to know about {course.name}.
                            (Static placeholder text as DB doesn't have description yet, but UI looks good!)</p>
                    </section>

                    <section className="detail-section card">
                        <h2>Topics Covered</h2>
                        <div className="tags">
                            {topics.length > 0 ? topics.map((t, i) => (
                                <span key={i} className="tag">{t.name}</span>
                            )) : <p>No specific topics listed.</p>}
                        </div>
                    </section>

                    <section className="detail-section card">
                        <h2>Course Content</h2>
                        {content.length > 0 ? (
                            <ul className="content-list">
                                {content.map((c, i) => (
                                    <li key={i}>
                                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="content-link">
                                            {c.type === 'Video' ? '📺' : '📄'} {c.url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No content uploaded yet.</p>
                        )}
                    </section>
                </div>

                <div className="sidebar cards">
                    <div className="card enroll-card">
                        <h3>Ready to start?</h3>
                        <button onClick={handleEnroll} className="btn-primary full-width">Enroll Now</button>
                    </div>

                    <div className="card">
                        <h3>Instructors</h3>
                        {instructors.length > 0 ? (
                            <ul className="list-unstyled">
                                {instructors.map((inst, i) => (
                                    <li key={i} className="instructor-item" style={{ marginBottom: '8px' }}>
                                        <strong>{inst.name}</strong>
                                        <span className="sub-text" style={{ marginLeft: '8px', color: '#6b7280' }}>• {inst.experience} years exp.</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No instructor assigned.</p>}
                    </div>

                    <div className="card">
                        <h3>Textbooks</h3>
                        {textbooks.length > 0 ? (
                            <ul className="list-unstyled">
                                {textbooks.map((tb, i) => (
                                    <li key={i} className="textbook-item">
                                        <em>{tb.title}</em> by {tb.author}
                                    </li>
                                ))}
                            </ul>
                        ) : <p>No textbooks listed.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailPage;

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
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

    const handleEnroll = async (courseId) => {
        try {
            await api.post('/student/enroll', { student_id: user.user_id, course_id: courseId });
            setModalInfo({ show: true, title: 'Success', message: 'Enrolled successfully!' });
            fetchMyCourses();
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
    };

    return (
        <div style={{ padding: '20px' }}>
            <Modal
                show={modalInfo.show}
                onClose={closeModal}
                title={modalInfo.title}
            >
                <p>{modalInfo.message}</p>
            </Modal>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Student Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </div>

            <h3>My Enrolled Courses</h3>
            <ul>
                {myCourses.map(c => (
                    <li key={c.course_id}>{c.name} (Score: {c.score !== null ? c.score : 'N/A'})</li>
                ))}
            </ul>

            <hr />

            <h3>Available Courses</h3>
            <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={fetchCourses}>Search</button>

            <div style={{ marginTop: '10px' }}>
                {courses.map(c => (
                    <div key={c.course_id} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
                        <strong>{c.name}</strong> - {c.duration} weeks - ${c.fees}
                        <button onClick={() => handleEnroll(c.course_id)} style={{ marginLeft: '10px' }}>Enroll</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;

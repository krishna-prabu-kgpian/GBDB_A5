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
        <div style={{ padding: '20px' }}>
            <Modal
                show={modalInfo.show}
                onClose={closeModal}
                title={modalInfo.title}
            >
                <p>{modalInfo.message}</p>
            </Modal>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Instructor Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </div>

            <h3>My Courses</h3>
            <ul>
                {myCourses.map(c => (
                    <li key={c.course_id}>
                        {c.name}
                        <button onClick={() => setSelectedCourse(c.course_id)} style={{ marginLeft: '10px' }}>Select to Add Content</button>
                    </li>
                ))}
            </ul>

            {selectedCourse && (
                <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '20px' }}>
                    <h4>Add Content to Course ID: {selectedCourse}</h4>
                    <form onSubmit={handleAddContent}>
                        <div>
                            <label>Content URL/Text: </label>
                            <input type="text" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} required />
                        </div>
                        <div>
                            <label>Type: </label>
                            <select value={contentType} onChange={(e) => setContentType(e.target.value)}>
                                <option value="Video">Video</option>
                                <option value="PDF">PDF</option>
                                <option value="Assignment">Assignment</option>
                            </select>
                        </div>
                        <button type="submit" style={{ marginTop: '10px' }}>Add Content</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InstructorDashboard;

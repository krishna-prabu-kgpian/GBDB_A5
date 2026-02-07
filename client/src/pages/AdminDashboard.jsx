import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [instructorId, setInstructorId] = useState('');
    const [courseId, setCourseId] = useState('');
    const [modalInfo, setModalInfo] = useState({ show: false, title: '', message: '' });

    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const instRes = await api.get('/admin/instructors');
            const courseRes = await api.get('/admin/courses');
            setInstructors(instRes.data);
            setCourses(courseRes.data);
        } catch (err) {
            console.error('Failed to fetch dropdown data', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else {
                console.error('API did not return an array:', res.data);
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/assign-teacher', { instructor_id: instructorId, course_id: courseId });
            setModalInfo({ show: true, title: 'Success', message: 'Assigned successfully' });
        } catch (err) {
            setModalInfo({
                show: true,
                title: 'Error',
                message: 'Assignment failed: ' + (err.response?.data?.error || err.message)
            });
        }
    };

    const [userToDelete, setUserToDelete] = useState(null);

    const handleDeleteClick = (userId) => {
        setUserToDelete(userId);
        setModalInfo({
            show: true,
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this user? This action cannot be undone.'
        });
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/admin/user/${userToDelete}`);
            // Close the confirmation modal first to avoid flickering transition
            setModalInfo({ ...modalInfo, show: false });
            setUserToDelete(null);

            // Re-fetch users
            await fetchUsers();

            // Optional: Show success toast or small notification instead of another full modal?
            // For now, let's just show a success modal but with a slight delay or clean state
            // actually, just refreshing the table is often enough feedback if the row disappears.
            // But to be explicit:
            setTimeout(() => {
                setModalInfo({ show: true, title: 'Success', message: 'User deleted successfully', onConfirm: null });
            }, 300);

        } catch (err) {
            setModalInfo({ show: true, title: 'Error', message: 'Delete failed' });
            setUserToDelete(null);
        }
    };

    const closeModal = () => {
        setModalInfo({ ...modalInfo, show: false });
        // Delay clearing userToDelete to prevents content jumping while modal fades out (if animated)
        // But here we don't have animation, so it's fine. 
        setTimeout(() => setUserToDelete(null), 100);
    };

    return (
        <div style={{ padding: '20px' }}>
            <Modal
                show={modalInfo.show}
                onClose={closeModal}
                onConfirm={userToDelete ? confirmDelete : null}
                title={modalInfo.title}
            >
                <p>{modalInfo.message}</p>
            </Modal>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Admin Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </div>

            <div style={{ marginBottom: '30px' }}>
                <h3>Assign Teacher to Course</h3>
                <form onSubmit={handleAssign}>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Instructor: </label>
                        <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} required>
                            <option value="">Select Instructor</option>
                            {instructors.map(inst => (
                                <option key={inst.instructor_id} value={inst.instructor_id}>
                                    {inst.name} (ID: {inst.instructor_id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Course: </label>
                        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                            <option value="">Select Course</option>
                            {courses.map(course => (
                                <option key={course.course_id} value={course.course_id}>
                                    {course.name} (ID: {course.course_id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Assign</button>
                </form>
            </div>

            <hr />

            <div>
                <h3>User Management</h3>
                <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(users) && users.map(u => (
                            <tr key={u.user_id}>
                                <td>{u.user_id}</td>
                                <td>{u.name}</td>
                                <td>{u.role}</td>
                                <td>{u.email}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteClick(u.user_id)}
                                        style={{ backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;

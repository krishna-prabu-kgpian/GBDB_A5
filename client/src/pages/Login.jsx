import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const role = await login(username, password);
            if (role) {
                switch (role) {
                    case 'Student': navigate('/student'); break;
                    case 'Instructor': navigate('/instructor'); break;
                    case 'Administrator': navigate('/admin'); break;
                    case 'Data_Analyst': navigate('/analyst'); break;
                    default: navigate('/');
                }
            }
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username: </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%' }} />
                </div>
                <button type="submit" style={{ padding: '10px 20px' }}>Login</button>
            </form>
            <p>Use seed data: stud1/pass, inst1/pass, admin/pass, analyst1/pass</p>
        </div>
    );
};

export default Login;

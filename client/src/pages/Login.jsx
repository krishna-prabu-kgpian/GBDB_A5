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
        <div className="detail-page fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--primary)', fontSize: '2rem' }}>Login</h2>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-sub)' }}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Enter your username"
                        />
                    </div>
                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-sub)' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="submit" className="btn-primary full-width" style={{ padding: '12px' }}>Login</button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: 'var(--text-sub)' }}>
                    <p style={{ fontWeight: '600', marginBottom: '10px' }}>Demo Credentials:</p>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li>Student: <code>stud1</code> / <code>pass</code></li>
                        <li>Instructor: <code>inst1</code> / <code>pass</code></li>
                        <li>Admin: <code>admin</code> / <code>pass</code></li>
                        <li>Analyst: <code>analyst1</code> / <code>pass</code></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;

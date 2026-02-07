import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AnalystDashboard = () => {
    const { logout } = useAuth();
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/analyst/stats');
                setStats(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h1>Data Analyst Dashboard</h1>
                <button onClick={logout}>Logout</button>
            </div>

            <h3>Course Statistics</h3>
            <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Student Count</th>
                        <th>Average Score</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map((row, i) => (
                        <tr key={i}>
                            <td>{row.name}</td>
                            <td>{row.student_count}</td>
                            <td>{row.avg_score !== null ? parseFloat(row.avg_score).toFixed(2) : 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnalystDashboard;

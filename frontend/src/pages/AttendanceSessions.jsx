import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import { FileText, Calendar, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AttendanceSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await attendanceAPI.getSessions();
            setSessions(response.data.sessions);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Attendance Sessions</h1>
                    <p className="page-subtitle">View all attendance sessions</p>
                </div>
            </div>

            <div className="sessions-list">
                {sessions.map((session) => (
                    <Link
                        key={session.id}
                        to={`/sessions/${session.id}`}
                        className="session-card glass-card"
                    >
                        <div className="session-header">
                            <div>
                                <h3 className="session-title">{session.subject}</h3>
                                <p className="session-meta">
                                    {session.class} {session.section && `- ${session.section}`}
                                </p>
                            </div>
                            <span className={`badge badge-${session.status === 'approved' ? 'success' :
                                    session.status === 'pending' ? 'warning' : 'error'
                                }`}>
                                {session.status}
                            </span>
                        </div>

                        <div className="session-stats">
                            <div className="session-stat">
                                <Users size={16} />
                                <span>{session.present_count}/{session.total_students} Present</span>
                            </div>
                            <div className="session-stat">
                                <Calendar size={16} />
                                <span>{new Date(session.session_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AttendanceSessions;

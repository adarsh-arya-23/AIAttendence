import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI } from '../services/api';
import {
    Users,
    Camera,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Calendar
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
    const { user, isAdmin, isTeacher } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await analyticsAPI.getDashboard();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">Welcome back, {user?.full_name}!</h1>
                        <p className="page-subtitle">
                            Here's what's happening with your attendance system today
                        </p>
                    </div>
                    {(isAdmin || isTeacher) && (
                        <Link to="/take-attendance" className="btn btn-primary">
                            <Camera size={20} />
                            Take Attendance
                        </Link>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    {isAdmin && (
                        <>
                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                                    <Users size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Total Students</p>
                                    <h3 className="stat-value">{stats?.total_students || 0}</h3>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'var(--gradient-accent)' }}>
                                    <Users size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Total Teachers</p>
                                    <h3 className="stat-value">{stats?.total_teachers || 0}</h3>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                                    <FileText size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Total Sessions</p>
                                    <h3 className="stat-value">{stats?.total_sessions || 0}</h3>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                                    <Clock size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Pending Review</p>
                                    <h3 className="stat-value">{stats?.pending_sessions || 0}</h3>
                                </div>
                            </div>
                        </>
                    )}

                    {isTeacher && (
                        <>
                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
                                    <FileText size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">My Sessions</p>
                                    <h3 className="stat-value">{stats?.my_sessions || 0}</h3>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                                    <Clock size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Pending Review</p>
                                    <h3 className="stat-value">{stats?.pending_sessions || 0}</h3>
                                </div>
                            </div>

                            <div className="stat-card glass-card">
                                <div className="stat-icon" style={{ background: 'var(--gradient-success)' }}>
                                    <Calendar size={24} />
                                </div>
                                <div className="stat-content">
                                    <p className="stat-label">Today's Sessions</p>
                                    <h3 className="stat-value">{stats?.todays_sessions || 0}</h3>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Recent Sessions */}
                {stats?.recent_sessions && stats.recent_sessions.length > 0 && (
                    <div className="recent-sessions">
                        <div className="section-header">
                            <h2>Recent Sessions</h2>
                            <Link to="/sessions" className="btn btn-ghost btn-sm">
                                View All
                            </Link>
                        </div>

                        <div className="sessions-list">
                            {stats.recent_sessions.map((session) => (
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
                                        {isAdmin && session.teacher_name && (
                                            <div className="session-stat">
                                                <Users size={16} />
                                                <span>{session.teacher_name}</span>
                                            </div>
                                        )}
                                    </div>

                                    {session.unknown_count > 0 && (
                                        <div className="session-warning">
                                            <Clock size={16} />
                                            <span>{session.unknown_count} unknown face(s) need review</span>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                {(isAdmin || isTeacher) && (
                    <div className="quick-actions">
                        <h2>Quick Actions</h2>
                        <div className="actions-grid">
                            <Link to="/take-attendance" className="action-card glass-card">
                                <Camera size={32} />
                                <h3>Take Attendance</h3>
                                <p>Capture classroom photo and mark attendance</p>
                            </Link>

                            <Link to="/students" className="action-card glass-card">
                                <Users size={32} />
                                <h3>Manage Students</h3>
                                <p>Add, edit, or view student profiles</p>
                            </Link>

                            <Link to="/analytics" className="action-card glass-card">
                                <TrendingUp size={32} />
                                <h3>View Analytics</h3>
                                <p>Track attendance patterns and insights</p>
                            </Link>

                            <Link to="/sessions" className="action-card glass-card">
                                <FileText size={32} />
                                <h3>View Sessions</h3>
                                <p>Review all attendance sessions</p>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

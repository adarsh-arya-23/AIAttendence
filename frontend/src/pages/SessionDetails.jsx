import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { attendanceAPI } from '../services/api';
import { CheckCircle, XCircle, AlertCircle, Calendar, Users } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const SessionDetails = () => {
    const { id } = useParams();
    const [session, setSession] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessionDetails();
    }, [id]);

    const fetchSessionDetails = async () => {
        try {
            const response = await attendanceAPI.getSessionById(id);
            setSession(response.data.session);
            setRecords(response.data.records);
        } catch (error) {
            console.error('Failed to fetch session details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            await attendanceAPI.approveSession(id);
            fetchSessionDetails();
        } catch (error) {
            console.error('Failed to approve session:', error);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (!session) return <div className="container"><p>Session not found</p></div>;

    return (
        <div className="container">
            <div className="glass-card p-xl mb-lg">
                <div className="flex justify-between items-center mb-lg">
                    <div>
                        <h1 className="page-title">{session.subject}</h1>
                        <p className="page-subtitle">
                            {session.class} {session.section && `- ${session.section}`}
                        </p>
                    </div>
                    <span className={`badge badge-${session.status === 'approved' ? 'success' :
                            session.status === 'pending' ? 'warning' : 'error'
                        }`}>
                        {session.status}
                    </span>
                </div>

                <div className="grid grid-3 mb-lg">
                    <div className="flex items-center gap-md">
                        <Calendar size={20} />
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Date</p>
                            <p className="font-semibold" style={{ margin: 0 }}>
                                {new Date(session.session_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-md">
                        <Users size={20} />
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Present</p>
                            <p className="font-semibold" style={{ margin: 0 }}>
                                {session.present_count}/{session.total_students}
                            </p>
                        </div>
                    </div>
                    {session.unknown_count > 0 && (
                        <div className="flex items-center gap-md">
                            <AlertCircle size={20} />
                            <div>
                                <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Unknown</p>
                                <p className="font-semibold" style={{ margin: 0 }}>{session.unknown_count}</p>
                            </div>
                        </div>
                    )}
                </div>

                {session.status === 'pending' && (
                    <button className="btn btn-success" onClick={handleApprove}>
                        <CheckCircle size={20} />
                        Approve Session
                    </button>
                )}
            </div>

            <div className="glass-card p-xl">
                <h2 className="mb-lg">Attendance Records</h2>
                <div className="grid grid-3">
                    {records.map((record) => (
                        <div key={record.id} className="glass-card p-md">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{record.roll_number}</p>
                                    <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                                        {record.class} {record.section}
                                    </p>
                                </div>
                                {record.status === 'present' ? (
                                    <CheckCircle size={20} color="var(--success)" />
                                ) : (
                                    <XCircle size={20} color="var(--error)" />
                                )}
                            </div>
                            {record.confidence && (
                                <p className="text-muted mt-sm" style={{ fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                                    Confidence: {(record.confidence * 100).toFixed(1)}%
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SessionDetails;

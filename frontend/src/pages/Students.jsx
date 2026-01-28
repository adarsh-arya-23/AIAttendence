import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentsAPI } from '../services/api';
import { Users, Plus, Search } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await studentsAPI.getAll({ search });
            setStudents(response.data.students);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-subtitle">Manage student profiles and face data</p>
                </div>
                <button className="btn btn-primary">
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            <div className="glass-card p-xl">
                <div className="flex gap-md mb-lg">
                    <div className="input-wrapper" style={{ flex: 1 }}>
                        <Search size={20} className="input-icon" />
                        <input
                            type="text"
                            className="glass-input"
                            placeholder="Search by roll number or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ paddingLeft: 'calc(var(--spacing-lg) + 28px)' }}
                        />
                    </div>
                    <button className="btn btn-ghost" onClick={fetchStudents}>
                        Search
                    </button>
                </div>

                {students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }}>
                        <Users size={48} style={{ margin: '0 auto var(--spacing-md)' }} />
                        <p>No students found. Add students to get started.</p>
                    </div>
                ) : (
                    <div className="grid grid-3">
                        {students.map((student) => (
                            <div key={student.id} className="glass-card p-lg">
                                <div className="flex items-center gap-md mb-md">
                                    <div className="user-avatar">{student.roll_number?.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-semibold">{student.roll_number}</h3>
                                        <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                                            {student.class} {student.section && `- ${student.section}`}
                                        </p>
                                    </div>
                                </div>
                                {student.photo_path && (
                                    <span className="badge badge-success">Photo Added</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Students;

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Profile</h1>
                    <p className="page-subtitle">Manage your account settings</p>
                </div>
            </div>

            <div className="glass-card p-xl">
                <div className="flex items-center gap-lg mb-xl">
                    <div className="user-avatar" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                        {user?.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2>{user?.full_name}</h2>
                        <p className="text-secondary" style={{ margin: 0 }}>@{user?.username}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
                    <div className="flex items-center gap-md">
                        <User size={20} style={{ color: 'var(--text-muted)' }} />
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Full Name</p>
                            <p className="font-semibold" style={{ margin: 0 }}>{user?.full_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-md">
                        <Mail size={20} style={{ color: 'var(--text-muted)' }} />
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Email</p>
                            <p className="font-semibold" style={{ margin: 0 }}>{user?.email}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-md">
                        <Shield size={20} style={{ color: 'var(--text-muted)' }} />
                        <div>
                            <p className="text-muted" style={{ fontSize: '0.875rem', margin: 0 }}>Role</p>
                            <p className="font-semibold" style={{ margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

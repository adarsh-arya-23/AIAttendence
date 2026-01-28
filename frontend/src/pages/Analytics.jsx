import React from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
    return (
        <div className="container">
            <div className="dashboard-header">
                <div>
                    <h1 className="page-title">Analytics</h1>
                    <p className="page-subtitle">Track attendance patterns and insights</p>
                </div>
            </div>

            <div className="glass-card p-xl" style={{ textAlign: 'center', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <BarChart3 size={64} style={{ color: 'var(--primary-400)', marginBottom: 'var(--spacing-lg)' }} />
                <h2>Analytics Dashboard</h2>
                <p className="text-secondary">
                    View detailed attendance statistics, trends, and reports
                </p>
            </div>
        </div>
    );
};

export default Analytics;

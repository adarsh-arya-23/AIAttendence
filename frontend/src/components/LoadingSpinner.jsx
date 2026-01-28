import React from 'react';

const LoadingSpinner = ({ size = 'md', fullScreen = false }) => {
    if (fullScreen) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                flexDirection: 'column',
                gap: 'var(--spacing-lg)'
            }}>
                <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
                <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
            </div>
        );
    }

    return <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />;
};

export default LoadingSpinner;

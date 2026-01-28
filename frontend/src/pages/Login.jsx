import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, User, AlertCircle } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left Side - Branding */}
                <div className="login-branding">
                    <div className="branding-content">
                        <div className="brand-icon">
                            <Camera size={48} />
                        </div>
                        <h1 className="brand-title">AI Attendance System</h1>
                        <p className="brand-subtitle">
                            Revolutionizing attendance tracking with facial recognition technology
                        </p>

                        <div className="features-list">
                            <div className="feature-item">
                                <div className="feature-icon">✨</div>
                                <div>
                                    <h3>Instant Recognition</h3>
                                    <p>Mark attendance in seconds with AI-powered face detection</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🎯</div>
                                <div>
                                    <h3>High Accuracy</h3>
                                    <p>Advanced algorithms ensure reliable identification</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">📊</div>
                                <div>
                                    <h3>Real-time Analytics</h3>
                                    <p>Track attendance patterns and generate insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="login-form-container">
                    <div className="login-form-wrapper">
                        <div className="login-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to continue to your dashboard</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <div className="input-wrapper">
                                    <User size={20} className="input-icon" />
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="glass-input"
                                        placeholder="Enter your username"
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={20} className="input-icon" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="glass-input"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="spinner spinner-sm" />
                                        <span>Signing in...</span>
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <div className="demo-credentials">
                                <p className="demo-title">Demo Credentials:</p>
                                <div className="demo-item">
                                    <strong>Admin:</strong> username: <code>admin</code> / password: <code>admin123</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

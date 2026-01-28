import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsAPI, attendanceAPI } from '../services/api';
import {
    Camera,
    Upload,
    CheckCircle,
    AlertCircle,
    Users,
    Calendar,
    Clock
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './TakeAttendance.css';

const TakeAttendance = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        class: '',
        section: '',
        subject: '',
        session_date: new Date().toISOString().split('T')[0],
        session_time: new Date().toTimeString().slice(0, 5)
    });

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (formData.class) {
            fetchSections(formData.class);
        }
    }, [formData.class]);

    const fetchClasses = async () => {
        try {
            const response = await studentsAPI.getClasses();
            setClasses(response.data.classes);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchSections = async (className) => {
        try {
            const response = await studentsAPI.getSections(className);
            setSections(response.data.sections);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size must be less than 10MB');
                return;
            }

            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
            setError('');
            setResult(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);

        if (!selectedImage) {
            setError('Please select a classroom image');
            return;
        }

        setProcessing(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('image', selectedImage);
            formDataToSend.append('class', formData.class);
            formDataToSend.append('section', formData.section);
            formDataToSend.append('subject', formData.subject);
            formDataToSend.append('session_date', formData.session_date);
            formDataToSend.append('session_time', formData.session_time);

            const response = await attendanceAPI.createSession(formDataToSend);
            setResult(response.data);

            // Show success and redirect after 3 seconds
            setTimeout(() => {
                navigate(`/sessions/${response.data.sessionId}`);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process attendance. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="take-attendance-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Take Attendance</h1>
                    <p className="page-subtitle">
                        Capture a classroom photo to automatically mark attendance
                    </p>
                </div>

                <div className="attendance-container">
                    {/* Form Section */}
                    <div className="attendance-form glass-card">
                        <h2>Session Details</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="class">Class *</label>
                                    <select
                                        id="class"
                                        name="class"
                                        value={formData.class}
                                        onChange={handleChange}
                                        className="glass-input"
                                        required
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map((cls) => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="section">Section</label>
                                    <select
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        className="glass-input"
                                    >
                                        <option value="">All Sections</option>
                                        {sections.map((sec) => (
                                            <option key={sec} value={sec}>{sec}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject">Subject *</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="glass-input"
                                        placeholder="e.g., Mathematics"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="session_date">Date *</label>
                                    <input
                                        type="date"
                                        id="session_date"
                                        name="session_date"
                                        value={formData.session_date}
                                        onChange={handleChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="session_time">Time *</label>
                                    <input
                                        type="time"
                                        id="session_time"
                                        name="session_time"
                                        value={formData.session_time}
                                        onChange={handleChange}
                                        className="glass-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div className="image-upload-section">
                                <h3>Classroom Photo</h3>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    style={{ display: 'none' }}
                                />

                                {!imagePreview ? (
                                    <div
                                        className="upload-area"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Camera size={48} />
                                        <p>Click to select classroom image</p>
                                        <span className="upload-hint">or drag and drop</span>
                                    </div>
                                ) : (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Classroom" />
                                        <button
                                            type="button"
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => {
                                                setSelectedImage(null);
                                                setImagePreview(null);
                                                setResult(null);
                                            }}
                                        >
                                            Change Image
                                        </button>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="error-message">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={processing || !selectedImage}
                            >
                                {processing ? (
                                    <>
                                        <div className="spinner spinner-sm" />
                                        <span>Processing Attendance...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        <span>Process Attendance</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Results Section */}
                    {(processing || result) && (
                        <div className="results-section glass-card">
                            <h2>Processing Results</h2>

                            {processing && (
                                <div className="processing-status">
                                    <LoadingSpinner />
                                    <p>AI is analyzing the classroom image...</p>
                                    <p className="processing-hint">This may take a few seconds</p>
                                </div>
                            )}

                            {result && (
                                <div className="results-content">
                                    <div className="success-message">
                                        <CheckCircle size={24} />
                                        <span>Attendance processed successfully!</span>
                                    </div>

                                    <div className="results-stats">
                                        <div className="result-stat">
                                            <div className="result-stat-icon success">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="result-stat-label">Present</p>
                                                <h3 className="result-stat-value">{result.summary.present}</h3>
                                            </div>
                                        </div>

                                        <div className="result-stat">
                                            <div className="result-stat-icon error">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <p className="result-stat-label">Absent</p>
                                                <h3 className="result-stat-value">{result.summary.absent}</h3>
                                            </div>
                                        </div>

                                        {result.summary.unknown > 0 && (
                                            <div className="result-stat">
                                                <div className="result-stat-icon warning">
                                                    <AlertCircle size={24} />
                                                </div>
                                                <div>
                                                    <p className="result-stat-label">Unknown</p>
                                                    <h3 className="result-stat-value">{result.summary.unknown}</h3>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <p className="redirect-message">
                                        Redirecting to session details...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TakeAttendance;

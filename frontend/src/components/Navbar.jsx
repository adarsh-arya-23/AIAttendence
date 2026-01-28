import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Camera,
    FileText,
    BarChart3,
    User,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAdmin, isTeacher } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
        { path: '/students', label: 'Students', icon: Users, roles: ['admin', 'teacher'] },
        { path: '/take-attendance', label: 'Take Attendance', icon: Camera, roles: ['admin', 'teacher'] },
        { path: '/sessions', label: 'Sessions', icon: FileText, roles: ['admin', 'teacher', 'student'] },
        { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'teacher'] }
    ];

    const filteredLinks = navLinks.filter(link => link.roles.includes(user?.role));

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setMobileMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/dashboard" className="navbar-logo">
                    <div className="logo-icon">
                        <Camera size={28} />
                    </div>
                    <span className="logo-text">AI Attendance</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    {filteredLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
                            >
                                <Icon size={20} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Menu */}
                <div className="navbar-user">
                    <Link to="/profile" className="user-profile">
                        <div className="user-avatar">
                            {user?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.full_name}</span>
                            <span className="user-role">{user?.role}</span>
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="btn-logout" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    {filteredLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{link.label}</span>
                            </Link>
                        );
                    })}
                    <Link
                        to="/profile"
                        className="mobile-nav-link"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="mobile-nav-link logout">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import TakeAttendance from './pages/TakeAttendance';
import AttendanceSessions from './pages/AttendanceSessions';
import SessionDetails from './pages/SessionDetails';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Components
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// App Layout
const AppLayout = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="page">
                {children}
            </main>
        </>
    );
};

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Dashboard />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/students"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <AppLayout>
                            <Students />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/take-attendance"
                element={
                    <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                        <AppLayout>
                            <TakeAttendance />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/sessions"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <AttendanceSessions />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/sessions/:id"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <SessionDetails />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/analytics"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Analytics />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <AppLayout>
                            <Profile />
                        </AppLayout>
                    </ProtectedRoute>
                }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import Detail from './components/Detail';
import ResidentPortal from './components/ResidentPortal';
import Login from './components/Login';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Page Transition Wrapper Component
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full min-h-screen"
        >
            {children}
        </motion.div>
    );
};

// Sub-component to handle AnimatePresence with router location
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />

                {/* Admin Routes */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PageTransition>
                                <Dashboard />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={<Navigate to="/admin" replace />}
                />

                <Route
                    path="/admin/add"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PageTransition>
                                <Detail />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/edit-resident/:id"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PageTransition>
                                <Detail />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route path="/add" element={<Navigate to="/admin/add" replace />} />

                {/* Resident Routes */}
                <Route
                    path="/resident/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['resident']}>
                            <PageTransition>
                                <ResidentPortal />
                            </PageTransition>
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resident"
                    element={<Navigate to="/resident/dashboard" replace />}
                />

                {/* Fallbacks */}
                <Route path="/pay/:flat_no" element={<Navigate to="/login" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    return (
        <div className="app-container">
            <BrowserRouter>
                <AuthProvider>
                    <AnimatedRoutes />
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;

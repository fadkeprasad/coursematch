// src/App.tsx

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AccountPage from './pages/AccountPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Firebase listener to check if the user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set to true if user exists, else false
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  return (
    <Router>
      <Routes>
        {/* If not authenticated, show WelcomePage. Otherwise, go to HomePage */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/home" /> : <WelcomePage />} />

        {/* Authenticated Routes */}
        <Route path="/home" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
        <Route path="/course/:courseId" element={isAuthenticated ? <CourseDetailsPage /> : <Navigate to="/" />} />
        <Route path="/account" element={isAuthenticated ? <AccountPage /> : <Navigate to="/" />} />

        {/* Catch-all for undefined routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/"} />} />
      </Routes>
    </Router>
  );
};

export default App;

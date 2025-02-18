// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import AccountPage from './pages/AccountPage';

function App() {
  return (
    <Router>
      {/* This can be your app-wide navigation or layout if needed */}
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<WelcomePage />} />

        {/* Authenticated Pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:courseId" element={<CourseDetailsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;

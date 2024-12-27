// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import SignUpPage from './pages/SignUpPage';
import SignInPage from './pages/SignInPage';
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

        {/* Auth Pages */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signin" element={<SignInPage />} />

        {/* Authenticated Pages */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/course/:courseId" element={<CourseDetailsPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
}

export default App;

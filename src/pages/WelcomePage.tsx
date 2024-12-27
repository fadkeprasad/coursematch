// src/pages/WelcomePage.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  return (
    <div style={{ margin: '20px' }}>
      <h1>Welcome to coursematch!</h1>
      <p>This app helps you review and select courses.</p>
      <Link to="/signin">Sign In</Link> | <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default WelcomePage;

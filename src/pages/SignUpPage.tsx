// src/pages/SignUpPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase';

const SignUpPage: React.FC = () => {
  // Track form fields in component state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Called when user clicks "Create Account"
  const handleSignUp = async () => {
    try {
      // Basic check that passwords match
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      // Basic check for @yale.edu domain
      if (!email.endsWith('@yale.edu')) {
        setError('Email must be @yale.edu');
        return;
      }

      // Use Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Send verification email
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
      }

      // Go back to the main page or sign in
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Sign Up</h2>
      <div>
        {/* Email input */}
        <input
          type="email"
          placeholder="Your Yale email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        {/* Password input */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        {/* Confirm password input */}
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button onClick={handleSignUp}>Create Account</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignUpPage;

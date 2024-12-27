// src/pages/SignInPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if the user has verified email
      if (!userCredential.user.emailVerified) {
        setError('Please verify your email before signing in.');
        return;
      }

      // If successful, go to Home
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Sign In</h2>
      <div>
        <input
          type="email"
          placeholder="Your Yale email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleSignIn}>Sign In</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SignInPage;

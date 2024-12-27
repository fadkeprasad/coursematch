// src/pages/AccountPage.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut, deleteUser, updatePassword } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

const AccountPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  // Sign out user
  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  // Delete user (requires recent auth, might throw an error if not recently re-authenticated)
  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteUser(user);
      // If successful, go to homepage
      navigate('/');
    } catch (err: any) {
      setError('Error deleting account: ' + err.message);
    }
  };

  // Update user’s password
  const handleUpdatePassword = async () => {
    if (!user) return;
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      alert('Password updated!');
    } catch (err: any) {
      setError('Error updating password: ' + err.message);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>Account Options</h2>
      {user ? (
        <>
          <p>Signed in as: {user.email}</p>
          <button onClick={handleSignOut}>Sign Out</button>
          <hr />

          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleUpdatePassword}>Update Password</button>
          <hr />

          <h3>Danger Zone</h3>
          <button onClick={handleDeleteAccount} style={{ color: 'red' }}>
            Delete Account
          </button>
          <p style={{ color: 'red' }}>{error}</p>
        </>
      ) : (
        <>
          <p>No user is signed in.</p>
          <Link to="/signin">Sign In</Link>
        </>
      )}
    </div>
  );
};

export default AccountPage;

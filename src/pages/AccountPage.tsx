// src/pages/AccountPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut, deleteUser, updatePassword } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles/AccountPage.css';

const AccountPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteUser(user);
      navigate('/');
    } catch (err: any) {
      setError('Error deleting account: ' + err.message);
    }
  };

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
    <div className="account-container">
      <h2>Account Options</h2>
      {user ? (
        <>
          <p>Signed in as: <strong>{user.email}</strong></p>
          <button className="btn btn-primary" onClick={handleSignOut}>Sign Out</button>
          <hr />

          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
          <button className="btn btn-secondary" onClick={handleUpdatePassword}>Update Password</button>
          <hr />

          <h3 className="danger">Danger Zone</h3>
          <button className="btn btn-danger" onClick={handleDeleteAccount}>Delete Account</button>
          {error && <p className="error-text">{error}</p>}
        </>
      ) : (
        <>
          <p>No user is signed in.</p>
          <Link to="/welcomepage" className="link">Sign In</Link>
        </>
      )}
    </div>
  );
};

export default AccountPage;

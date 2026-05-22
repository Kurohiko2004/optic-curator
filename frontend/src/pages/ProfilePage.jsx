import React, { useState } from 'react';
import Header from '../components/layout/Header';
import './ProfilePage.css';
import { useToast } from '../context/ToastContext';

const ProfilePage = ({ onLoginClick, onSignupClick, user, onLogout }) => {
  const [username, setUsername] = useState(user?.username || '');

  const [profileError, setProfileError] = useState('');

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const { showToast } = useToast();

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setProfileError('');


    if (!username.trim()) {
      setProfileError('Username cannot be empty');
      return;
    }

    // Mock successful update
    showToast('Profile updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswordError('');


    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setPasswordError('Please fill out all password fields');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    // Mock successful password change
    showToast('Password changed successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="profile-page">
      <Header
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        user={user}
        onLogout={onLogout}
      />

      <div className="profile-container">
        <div className="profile-header-section">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring"></div>
            {getInitials(user?.username)}
          </div>
          <div className="profile-summary">
            <h1>{user?.username || 'User Profile'}</h1>
            <div className={`profile-badge ${user?.role === 'Admin' ? 'admin' : ''}`}>
              {user?.role || 'User'}
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Section 1: Update Account */}
          <div className="profile-card">
            <h3>Account Settings</h3>


            {profileError && <div className="error-alert">⚠ {profileError}</div>}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled />
              </div>

              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>

              <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '10px', height: '48px' }}>
                Update Profile
              </button>
            </form>
          </div>

          {/* Section 2: Change Password */}
          <div className="profile-card">
            <h3>Change Password</h3>


            {passwordError && <div className="error-alert">⚠ {passwordError}</div>}

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <button type="submit" className="button-primary" style={{ width: '100%', marginTop: '10px', height: '48px' }}>
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

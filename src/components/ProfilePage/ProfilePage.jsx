import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { getProfile, updateProfile, requestProfileChange, isSuperAdmin, isAdmin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photo, setPhoto] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [originalData, setOriginalData] = useState({});
  const fileInput = useRef();

  useEffect(() => {
    // Load profile data from AuthContext
    const profile = getProfile();
    setName(profile.name);
    setEmail(profile.email);
    setPhoto(profile.avatar);
    setTempEmail(profile.email);
    setOriginalData({
      name: profile.name,
      email: profile.email,
      photo: profile.avatar
    });
  }, [getProfile]);

  // Refresh profile data when component mounts or when user returns
  useEffect(() => {
    const refreshProfileData = () => {
      const profile = getProfile();
      setName(profile.name);
      setEmail(profile.email);
      setPhoto(profile.avatar);
      setTempEmail(profile.email);
      setOriginalData({
        name: profile.name,
        email: profile.email,
        photo: profile.avatar
      });
    };

    // Listen for storage changes (when admin approves changes)
    const handleStorageChange = () => {
      refreshProfileData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [getProfile]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (500k max)
      if (file.size > 500000) {
        alert('File size must be less than 500KB');
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload a valid image file (jpg, png, gif)');
        return;
      }
      
      setPhoto(URL.createObjectURL(file));
    }
  };

  const handleEmailChange = () => {
    setTempEmail(email);
    setIsEditingEmail(true);
  };

  const handleEmailSave = () => {
    setEmail(tempEmail);
    setIsEditingEmail(false);
  };

  const handleEmailCancel = () => {
    setTempEmail(email);
    setIsEditingEmail(false);
  };

  const handleSaveChanges = () => {
    const changes = {};
    
    // Check what has changed
    if (name !== originalData.name) {
      changes.name = name;
    }
    if (email !== originalData.email) {
      changes.email = email;
    }
    if (photo !== originalData.photo) {
      changes.avatar = photo;
    }
    
    // If no changes, just navigate back
    if (Object.keys(changes).length === 0) {
      alert('No changes detected.');
      navigate('/dashboard');
      return;
    }
    
    // Super admins and admins can update directly
    if (isSuperAdmin() || isAdmin()) {
      updateProfile(changes);
      alert('Profile updated successfully!');
      navigate('/dashboard');
    } else {
      // Regular users need approval for name/email changes
      const needsApproval = changes.name || changes.email;
      
      if (needsApproval) {
        // Submit for approval
        requestProfileChange(changes);
        alert('Your profile changes have been submitted for admin approval. You will be notified once reviewed.');
        navigate('/dashboard');
      } else {
        // Avatar changes can be updated directly
        updateProfile(changes);
        alert('Profile updated successfully!');
        navigate('/dashboard');
      }
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setName(originalData.name);
    setEmail(originalData.email);
    setPhoto(originalData.photo);
    setIsEditingEmail(false);
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="profile-card">
      {/* Title inside card */}
      <h1 className="profile-title">Profile</h1>

      {/* Profile Photo Section */}
      <div className="profile-row-grid">
        <div className="profile-section-heading">Profile photo</div>
        <div className="profile-photo-block">
          <img src={photo} alt="Profile" className="profile-photo" />
          <div>
            <button className="upload-btn" onClick={() => fileInput.current.click()}>
              + Upload photo
            </button>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.gif"
              ref={fileInput}
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
            <p className="upload-info">
              Supported formats: jpg, gif or png.<br />
              Max file size: 500k.
            </p>
          </div>
        </div>
      </div>

      {/* Name Section */}
      <div className="profile-row-grid">
        <div className="profile-section-heading">Contact</div>
        <div className="profile-input-block">
          <label className="profile-label">Full name*</label>
          <input
            type="text"
            className="profile-input"
            placeholder="Type your name here"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      {/* Email Section */}
      <div className="profile-row-grid">
        <div className="profile-section-heading">Email address</div>
        <div className="email-row">
          {isEditingEmail ? (
            <div className="email-edit-block">
              <input
                type="email"
                className="profile-input"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="Enter your email"
              />
              <div className="email-edit-buttons">
                <button className="email-save-btn" onClick={handleEmailSave}>Save</button>
                <button className="email-cancel-btn" onClick={handleEmailCancel}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <span className="email-value">{email}</span>
              <button className="change-email-btn" onClick={handleEmailChange}>Change email address</button>
            </>
          )}
        </div>
      </div>

      {/* Centered Action Buttons */}
      <div className="action-buttons-centered">
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
        <button className="save-btn" onClick={handleSaveChanges}>✓ Save changes</button>
      </div>
    </div>
  );
}

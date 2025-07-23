import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email] = useState('john.deere@email.com');
  const [photo, setPhoto] = useState('/path/to/avatar.jpg');
  const fileInput = useRef();
  const navigate = useNavigate();

  const handlePhotoUpload = e => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      {/* PHOTO SECTION */}
      <div className="profile-photo-section">
        <img src={photo} alt="User" className="profile-photo" />
        <button
          className="profile-upload-btn"
          onClick={() => fileInput.current.click()}
        >
          + Upload photo
        </button>
        <input
          type="file"
          accept=".jpg,.jpeg,.gif,.png"
          ref={fileInput}
          style={{ display: 'none' }}
          onChange={handlePhotoUpload}
        />
        <div className="profile-upload-info">
          Supported formats: jpg, gif or png.<br />
          Max file size: 500k.
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="profile-section">
        <label htmlFor="profile-fullname" className="profile-label">
          Full name*
        </label>
        <input
          id="profile-fullname"
          className="profile-input"
          placeholder="Type your name here"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>

      {/* EMAIL SECTION - WITH HEADING */}
      <div className="profile-section">
        <div className="profile-label">Email address</div>
        <div className="profile-email-row">
          <span className="profile-email">{email}</span>
          <button className="profile-change-email-btn">
            Change email address
          </button>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="profile-actions">
        <button
          className="profile-cancel-btn"
          onClick={() => navigate('/dashboard')}
        >
          Cancel
        </button>
        <button className="profile-save-btn">
          ✓ Save changes
        </button>
      </div>
    </div>
  );
}

import React, { useRef, useState } from 'react';
import './ProfilePage.css';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [email] = useState('john.deere@email.com');
  const [photo, setPhoto] = useState('https://via.placeholder.com/100x100.png');
  const fileInput = useRef();

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
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
          <span className="email-value">{email}</span>
          <button className="change-email-btn">Change email address</button>
        </div>
      </div>

      {/* Centered Action Buttons */}
      <div className="action-buttons-centered">
        <button className="cancel-btn">Cancel</button>
        <button className="save-btn">✓ Save changes</button>
      </div>
    </div>
  );
}

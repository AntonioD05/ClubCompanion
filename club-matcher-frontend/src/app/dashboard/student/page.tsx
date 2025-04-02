'use client';

import { useState, useRef } from 'react';
import styles from './studentdashboard.module.css';

// List of possible interests
const INTERESTS_OPTIONS = [
  'Technology',
  'Sports',
  'Arts',
  'Academic',
  'Cultural',
  'Music',
  'Science',
  'Gaming',
  'Social',
  'Political',
  'Environmental',
  'Business',
  'Health',
  'Language',
  'Religious'
];

// Mock user data - in a real application, this would come from an API
const mockUserData = {
  name: 'John Doe',
  email: 'johndoe@ufl.edu',
  interests: ['Technology', 'Sports', 'Gaming'],
  profilePicture: null
};

// Profile Section Component
const ProfileSection = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [selectedInterests, setSelectedInterests] = useState(userData.interests);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Handle interest toggle
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Handle password change
  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    // In a real app, you'd call an API to update the password
    console.log('Password would be updated here');
    setPasswordError('');
    setShowPasswordFields(false);
    setPassword({ current: '', new: '', confirm: '' });
  };

  // Handle profile picture upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.section}>
      <h2>My Profile</h2>
      
      <div className={styles.profileContainer}>
        {/* Profile Picture Section */}
        <div className={styles.profilePictureSection}>
          <div 
            className={styles.profilePicture}
            onClick={() => fileInputRef.current?.click()}
            style={{ backgroundImage: profileImage ? `url(${profileImage})` : 'none' }}
          >
            {!profileImage && <span>+</span>}
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            style={{ display: 'none' }}
          />
          <button 
            className={styles.uploadButton}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </button>
        </div>

        {/* Profile Info Section */}
        <div className={styles.profileInfoSection}>
          <div className={styles.formGroup}>
            <label>Name</label>
            <input 
              type="text" 
              value={userData.name} 
              readOnly 
              className={styles.readOnlyField}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Email</label>
            <input 
              type="email" 
              value={userData.email} 
              readOnly 
              className={styles.readOnlyField}
            />
          </div>
          
          {/* Password Section */}
          <div className={styles.formGroup}>
            <div className={styles.passwordHeader}>
              <label>Password</label>
              <button 
                type="button" 
                className={styles.changePasswordButton}
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            
            {showPasswordFields && (
              <div className={styles.passwordFields}>
                {passwordError && <div className={styles.error}>{passwordError}</div>}
                
                <div className={styles.formGroup}>
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    value={password.current} 
                    onChange={(e) => setPassword({...password, current: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={password.new} 
                    onChange={(e) => setPassword({...password, new: e.target.value})}
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    value={password.confirm} 
                    onChange={(e) => setPassword({...password, confirm: e.target.value})}
                  />
                </div>
                
                <button 
                  type="button" 
                  className={styles.updatePasswordButton}
                  onClick={handlePasswordChange}
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Interests Section */}
      <div className={styles.interestsSection}>
        <h3>Interests</h3>
        <p className={styles.interestsHint}>Select all that apply to you</p>
        
        <div className={styles.interestsList}>
          {INTERESTS_OPTIONS.map(interest => (
            <div 
              key={interest} 
              className={`${styles.interestTag} ${selectedInterests.includes(interest) ? styles.selected : ''}`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </div>
          ))}
        </div>
        
        <button 
          className={styles.saveButton}
          onClick={() => console.log('Saving interests:', selectedInterests)}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

// Rest of your components (SearchSection, SavedClubsSection) remain the same
const SearchSection = () => (
  <div className={styles.section}>
    <h2>Find Clubs</h2>
    <div className={styles.filterContainer}>
      <select className={styles.filterDropdown} defaultValue="">
        <option value="" disabled>Filter by interest</option>
        <option value="technology">Technology</option>
        <option value="sports">Sports</option>
        <option value="arts">Arts</option>
        <option value="academic">Academic</option>
        <option value="cultural">Cultural</option>
      </select>
    </div>
    <p>Club search results will appear here.</p>
  </div>
);

const SavedClubsSection = () => (
  <div className={styles.section}>
    <h2>Saved Clubs</h2>
    <p>Your saved clubs will appear here.</p>
  </div>
);

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Student Dashboard</h1>
        <a href="/" className={styles.logoutButton}>
          Logout
        </a>
      </header>

      <main className={styles.main}>
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'search' && <SearchSection />}
        {activeTab === 'saved' && <SavedClubsSection />}
      </main>

      <nav className={styles.navBar}>
        <button 
          className={`${styles.navButton} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${activeTab === 'search' ? styles.active : ''}`}
          onClick={() => setActiveTab('search')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Find Clubs</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${activeTab === 'saved' ? styles.active : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Saved</span>
        </button>
      </nav>
    </div>
  );
}
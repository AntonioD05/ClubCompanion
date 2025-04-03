'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './studentdashboard.module.css';

// Mock club data
const mockClubs = [
  {
    id: 1,
    name: 'Engineering Club',
    description: 'A club for students interested in all fields of engineering and technology.',
    interests: ['Technology', 'Science', 'Academic'],
    members: 45,
    profilePicture: null
  },
  {
    id: 2,
    name: 'Sports Club',
    description: 'Join us for various sports activities, tournaments, and fitness sessions.',
    interests: ['Sports', 'Health'],
    members: 78,
    profilePicture: null
  },
  {
    id: 3,
    name: 'Art Society',
    description: 'Express your creativity through various art forms and exhibitions.',
    interests: ['Arts', 'Cultural'],
    members: 32,
    profilePicture: null
  },
  {
    id: 4,
    name: 'Debate Team',
    description: 'Enhance your public speaking and argumentation skills through competitive debates.',
    interests: ['Academic', 'Social'],
    members: 24,
    profilePicture: null
  },
  {
    id: 5,
    name: 'Environmental Action',
    description: 'Working towards campus sustainability and environmental awareness.',
    interests: ['Environmental', 'Social'],
    members: 38,
    profilePicture: null
  }
];

// Mock user data
const mockUserData = {
  name: 'John Doe',
  email: 'johndoe@ufl.edu',
  interests: ['Technology', 'Sports', 'Gaming'],
  profilePicture: null as string | null
};

// List of available interests for filtering
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
  const [successMessage, setSuccessMessage] = useState('');

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
    
    if (password.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    // In a real app, you'd call an API to update the password
    console.log('Password would be updated here');
    setPasswordError('');
    setShowPasswordFields(false);
    setPassword({ current: '', new: '', confirm: '' });
    
    // Show success message
    setSuccessMessage('Password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
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

  // Save profile changes
  const saveProfileChanges = () => {
    // In a real app, you'd call an API to update the user data
    setUserData({
      ...userData,
      interests: selectedInterests,
      profilePicture: profileImage
    });
    
    // Show success message
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className={styles.section}>
      <h2>My Profile</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
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
              onChange={(e) => setUserData({...userData, name: e.target.value})}
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
            <div className={styles.inputHelp}>Email cannot be changed</div>
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
        <h3>My Interests</h3>
        <p className={styles.interestsHint}>Select all that apply to you. This helps us recommend relevant clubs.</p>
        
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
          onClick={saveProfileChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const SearchSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [memberFilter, setMemberFilter] = useState('');
  const [savedClubs, setSavedClubs] = useState<number[]>([]);

  // Filter clubs based on search query and filters
  const filteredClubs = mockClubs.filter(club => {
    // Filter by search query
    const matchesSearch = searchQuery === '' || 
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by selected interests
    const matchesInterests = selectedInterests.length === 0 || 
      club.interests.some(interest => selectedInterests.includes(interest));
    
    // Filter by member count
    let matchesMembers = true;
    if (memberFilter === 'small') {
      matchesMembers = club.members < 30;
    } else if (memberFilter === 'medium') {
      matchesMembers = club.members >= 30 && club.members < 60;
    } else if (memberFilter === 'large') {
      matchesMembers = club.members >= 60;
    }
    
    return matchesSearch && matchesInterests && matchesMembers;
  });

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Toggle saving a club
  const toggleSaveClub = (clubId: number) => {
    if (savedClubs.includes(clubId)) {
      setSavedClubs(savedClubs.filter(id => id !== clubId));
    } else {
      setSavedClubs([...savedClubs, clubId]);
    }
  };

  // Generate club initials for avatar
  const getClubInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.section}>
      <h2>Find Clubs</h2>
      
      {/* Search and filters */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search clubs by name or description"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filter section */}
      <div className={styles.filterSection}>
        <h3>Filters</h3>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Club Size</label>
          <select 
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className={styles.filterDropdown}
          >
            <option value="">Any size</option>
            <option value="small">Small (&lt; 30 members)</option>
            <option value="medium">Medium (30-60 members)</option>
            <option value="large">Large (&gt; 60 members)</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Interests</label>
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
        </div>
      </div>

      {/* Club results */}
      <div className={styles.clubResults}>
        <h3>Results ({filteredClubs.length} clubs found)</h3>
        
        {filteredClubs.length > 0 ? (
          <div className={styles.clubsList}>
            {filteredClubs.map(club => (
              <div key={club.id} className={styles.clubCard}>
                <div className={styles.clubHeader}>
                  <div className={styles.clubAvatar}>
                    {club.profilePicture ? (
                      <div 
                        className={styles.clubAvatarImage} 
                        style={{ backgroundImage: `url(${club.profilePicture})` }}
                      />
                    ) : (
                      <div className={styles.clubAvatarInitials}>
                        {getClubInitials(club.name)}
                      </div>
                    )}
                  </div>
                  <div className={styles.clubInfo}>
                    <h4 className={styles.clubName}>{club.name}</h4>
                    <div className={styles.clubMembers}>{club.members} members</div>
                  </div>
                  <button 
                    className={`${styles.saveButton} ${savedClubs.includes(club.id) ? styles.saved : ''}`}
                    onClick={() => toggleSaveClub(club.id)}
                    title={savedClubs.includes(club.id) ? "Remove from saved" : "Save club"}
                  >
                    {savedClubs.includes(club.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                      </svg>
                    )}
                  </button>
                </div>
                <div className={styles.clubDescription}>{club.description}</div>
                <div className={styles.clubTags}>
                  {club.interests.map(interest => (
                    <span key={interest} className={styles.clubTag}>{interest}</span>
                  ))}
                </div>
                <button className={styles.contactButton}>
                  Contact Club
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.emptyStateIcon}>🔍</div>
            <p>No clubs match your search criteria</p>
            <button 
              className={styles.clearFiltersButton}
              onClick={() => {
                setSearchQuery('');
                setSelectedInterests([]);
                setMemberFilter('');
              }}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const SavedClubsSection = () => {
  const [savedClubIds, setSavedClubIds] = useState<number[]>([1, 3, 5]); // Mock saved club IDs
  const [expandedClubId, setExpandedClubId] = useState<number | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [activeClubId, setActiveClubId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter mock clubs to only show saved ones
  const savedClubs = mockClubs.filter(club => savedClubIds.includes(club.id));

  // Generate club initials for avatar
  const getClubInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Remove club from saved
  const removeFromSaved = (clubId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent expanding the club card
    setSavedClubIds(savedClubIds.filter(id => id !== clubId));
    
    // Show success message
    setSuccessMessage('Club removed from saved');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Toggle expanded club view
  const toggleClubExpanded = (clubId: number) => {
    if (expandedClubId === clubId) {
      setExpandedClubId(null);
    } else {
      setExpandedClubId(clubId);
    }
  };

  // Open contact modal
  const openContactModal = (clubId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent expanding the club card
    setActiveClubId(clubId);
    setContactModalOpen(true);
  };

  // Send contact message
  const sendContactMessage = () => {
    if (!contactMessage.trim() || !activeClubId) return;
    
    // In a real app, you'd send this message via an API
    console.log(`Sending message to club #${activeClubId}: ${contactMessage}`);
    
    // Reset the form and close modal
    setContactMessage('');
    setContactModalOpen(false);
    setActiveClubId(null);
    
    // Show success message
    setSuccessMessage('Message sent successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Get active club
  const activeClub = activeClubId ? mockClubs.find(club => club.id === activeClubId) : null;

  return (
    <div className={styles.section}>
      <h2>Saved Clubs</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      {savedClubs.length > 0 ? (
        <div className={styles.savedClubsList}>
          {savedClubs.map(club => (
            <div 
              key={club.id} 
              className={`${styles.savedClubCard} ${expandedClubId === club.id ? styles.expanded : ''}`}
              onClick={() => toggleClubExpanded(club.id)}
            >
              <div className={styles.savedClubHeader}>
                <div className={styles.clubAvatar}>
                  {club.profilePicture ? (
                    <div 
                      className={styles.clubAvatarImage} 
                      style={{ backgroundImage: `url(${club.profilePicture})` }}
                    />
                  ) : (
                    <div className={styles.clubAvatarInitials}>
                      {getClubInitials(club.name)}
                    </div>
                  )}
                </div>
                <div className={styles.clubInfo}>
                  <h4 className={styles.clubName}>{club.name}</h4>
                  <div className={styles.clubMembers}>{club.members} members</div>
                </div>
                <button 
                  className={`${styles.removeButton}`}
                  onClick={(e) => removeFromSaved(club.id, e)}
                  title="Remove from saved"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
              </div>
              
              {expandedClubId === club.id && (
                <div className={styles.savedClubDetails}>
                  <div className={styles.clubDescription}>{club.description}</div>
                  <div className={styles.clubTags}>
                    {club.interests.map(interest => (
                      <span key={interest} className={styles.clubTag}>{interest}</span>
                    ))}
                  </div>
                  <div className={styles.clubActions}>
                    <button 
                      className={styles.contactButton}
                      onClick={(e) => openContactModal(club.id, e)}
                    >
                      Contact Club
                    </button>
                    <button className={styles.viewDetailsButton}>
                      View Full Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          <div className={styles.emptyStateIcon}>📚</div>
          <p>You haven't saved any clubs yet</p>
          <button 
            className={styles.clearFiltersButton}
            onClick={() => {
              const setActiveTab = (tab: string) => {
                const event = new CustomEvent('set-active-tab', { detail: tab });
                document.dispatchEvent(event);
              };
              setActiveTab('search');
            }}
          >
            Find Clubs
          </button>
        </div>
      )}
      
      {/* Contact Modal */}
      {contactModalOpen && activeClub && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Contact {activeClub.name}</h3>
              <button 
                className={styles.closeModalButton}
                onClick={() => setContactModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Message</label>
                <textarea 
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className={styles.contactTextarea}
                  placeholder="Write your message here..."
                  rows={4}
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setContactModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  className={styles.sendButton}
                  onClick={sendContactMessage}
                  disabled={!contactMessage.trim()}
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  // Add event listener for the custom event
  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };

    // Add event listener
    document.addEventListener('set-active-tab', handleSetActiveTab as EventListener);

    // Clean up
    return () => {
      document.removeEventListener('set-active-tab', handleSetActiveTab as EventListener);
    };
  }, []);

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
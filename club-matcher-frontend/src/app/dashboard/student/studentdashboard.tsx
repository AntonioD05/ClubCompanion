'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './studentdashboard.module.css';

// Define Club interface for type safety
interface Club {
  id: number;
  name: string;
  description: string;
  interests: string[];
  members: number;
  profilePicture: string | null;
}

// Mock club data
const mockClubs: Club[] = [
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
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    interests: [] as string[],
    profilePicture: null as string | null
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
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
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Load user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsDataLoading(true);
        setLoadError('');
        // Get student ID from sessionStorage
        const storedId = sessionStorage.getItem('studentId');
        const studentId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        const response = await fetch(`/api/profile/student/${studentId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded student data:", data);
          
          setUserData({
            name: data.name || '',
            email: data.email || '',
            interests: data.interests || [],
            profilePicture: data.profile_picture
          });
          setSelectedInterests(data.interests || []);
          if (data.profile_picture) {
            setProfileImage(data.profile_picture);
          }
        } else {
          const errorData = await response.json();
          setLoadError(`Failed to load profile: ${errorData.detail || 'Unknown error'}`);
          console.error('Error loading profile:', errorData);
        }
      } catch (error) {
        setLoadError('Failed to connect to server. Please try again later.');
        console.error('Error fetching user data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
  const saveProfileChanges = async () => {
    setIsLoading(true);

    try {
      // Get student ID from sessionStorage
      const storedId = sessionStorage.getItem('studentId');
      const studentId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
      
      const profileData = {
        name: userData.name,
        interests: selectedInterests,
        profile_picture: profileImage
      };

      const response = await fetch(`/api/profile/student/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile');
      }

      // Update local state
      setUserData({
        ...userData,
        interests: selectedInterests,
        profilePicture: profileImage
      });
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh data from server after 1 second (to allow database to update)
      setTimeout(async () => {
        try {
          const storedId = sessionStorage.getItem('studentId');
          const studentId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
          const refreshResponse = await fetch(`/api/profile/student/${studentId}`);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setUserData({
              name: refreshData.name || '',
              email: refreshData.email || '',
              interests: refreshData.interests || [],
              profilePicture: refreshData.profile_picture
            });
            if (refreshData.profile_picture) {
              setProfileImage(refreshData.profile_picture);
            }
            console.log("Profile data refreshed:", refreshData);
          }
        } catch (refreshError) {
          console.error('Error refreshing profile data:', refreshError);
        }
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSuccessMessage('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  return (
    <div className={styles.section}>
      <h2>My Profile</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      {loadError && (
        <div className={styles.error}>
          {loadError}
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}
      
      {isDataLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading profile data...</div>
        </div>
      ) : (
        <div className={styles.profileContainer}>
          {/* Profile Picture Section */}
          <div className={styles.profilePictureSection}>
            <div 
              className={styles.profilePicture}
              onClick={() => fileInputRef.current?.click()}
              style={{ backgroundImage: profileImage ? 
                (profileImage.startsWith('data:') ? `url(${profileImage})` : `url('${profileImage}')`) 
                : 'none' 
              }}
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
      )}
      
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
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
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
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [activeClubId, setActiveClubId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch clubs from API
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch('/api/clubs');
        
        if (response.ok) {
          const data = await response.json();
          setClubs(data);
        } else {
          const errorData = await response.json();
          setError(`Failed to load clubs: ${errorData.detail || 'Unknown error'}`);
          console.error('Error loading clubs:', errorData);
          // Fallback to mock data if API fails
          setClubs(mockClubs);
        }
      } catch (error) {
        setError('Failed to connect to server. Using sample data instead.');
        console.error('Error fetching clubs:', error);
        // Fallback to mock data on error
        setClubs(mockClubs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClubs();
  }, []);

  // Filter clubs based on search query and filters
  const filteredClubs = clubs.filter(club => {
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

  // Open contact modal
  const openContactModal = (clubId: number) => {
    setActiveClubId(clubId);
    setContactModalOpen(true);
  };

  // Send contact message
  const sendContactMessage = async () => {
    if (!contactMessage.trim() || !activeClubId) return;
    
    try {
      // Get student ID from sessionStorage
      const storedId = sessionStorage.getItem('studentId');
      const studentId = storedId ? parseInt(storedId) : 1;
      
      const messageData = {
        content: contactMessage,
        recipient_id: activeClubId,
        recipient_type: 'club'
      };
      
      const response = await fetch(`/api/messages/student/${studentId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        // Reset form and close modal
        setContactMessage('');
        setContactModalOpen(false);
        setActiveClubId(null);
        
        // Show success message
        setSuccessMessage('Message sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Switch to messages tab to view the conversation
        setTimeout(() => {
          const setActiveTab = (tab: string) => {
            const event = new CustomEvent('set-active-tab', { detail: tab });
            document.dispatchEvent(event);
          };
          setActiveTab('messages');
        }, 1500);
      } else {
        const errorData = await response.json();
        setSuccessMessage(`Failed to send message: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSuccessMessage('Failed to send message. Please try again.');
    }
  };

  return (
    <div className={styles.section}>
      <h2>Find Clubs</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
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
        
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.loading}>Loading clubs...</div>
          </div>
        ) : filteredClubs.length > 0 ? (
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
                <button 
                  className={styles.contactButton}
                  onClick={() => openContactModal(club.id)}
                >
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
      
      {/* Contact Modal */}
      {contactModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Contact {activeClubId ? mockClubs.find(c => c.id === activeClubId)?.name : 'Club'}</h3>
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
  const sendContactMessage = async () => {
    if (!contactMessage.trim() || !activeClubId) return;
    
    try {
      // Get student ID from sessionStorage
      const storedId = sessionStorage.getItem('studentId');
      const studentId = storedId ? parseInt(storedId) : 1;
      
      const messageData = {
        content: contactMessage,
        recipient_id: activeClubId,
        recipient_type: 'club'
      };
      
      const response = await fetch(`/api/messages/student/${studentId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        // Reset form and close modal
        setContactMessage('');
        setContactModalOpen(false);
        setActiveClubId(null);
        
        // Show success message
        setSuccessMessage('Message sent successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Switch to messages tab to view the conversation
        setTimeout(() => {
          const setActiveTab = (tab: string) => {
            const event = new CustomEvent('set-active-tab', { detail: tab });
            document.dispatchEvent(event);
          };
          setActiveTab('messages');
        }, 1500);
      } else {
        const errorData = await response.json();
        setSuccessMessage(`Failed to send message: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSuccessMessage('Failed to send message. Please try again.');
    }
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

// Messages Section Component
const MessagesSection = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Load message threads from backend
  useEffect(() => {
    const fetchMessageThreads = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        
        // Get student ID from sessionStorage
        const storedId = sessionStorage.getItem('studentId');
        const studentId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        
        const response = await fetch(`/api/messages/student/${studentId}/threads`);
        
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        } else {
          const errorData = await response.json();
          setLoadError(`Failed to load messages: ${errorData.detail || 'Unknown error'}`);
          console.error('Error loading messages:', errorData);
        }
      } catch (error) {
        setLoadError('Failed to connect to server. Please try again later.');
        console.error('Error fetching message threads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessageThreads();
  }, []);

  // Load conversation when a thread is selected
  const loadConversation = async (contactId: number, contactType: string) => {
    try {
      setIsLoading(true);
      
      // Get student ID from sessionStorage
      const storedId = sessionStorage.getItem('studentId');
      const studentId = storedId ? parseInt(storedId) : 1;
      
      const response = await fetch(`/api/messages/student/${studentId}/conversation/${contactType}/${contactId}`);
      
      if (response.ok) {
        const data = await response.json();
        setActiveConversation(data);
        
        // Update thread read status in the threads list
        setThreads(threads.map(thread => {
          if (thread.contact_id === contactId && thread.contact_type === contactType) {
            return {
              ...thread,
              unread_count: 0,
              latest_message: {
                ...thread.latest_message,
                read: true
              }
            };
          }
          return thread;
        }));
        
        // Scroll to bottom of messages after they load
        setTimeout(() => {
          if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
          }
        }, 100);
      } else {
        const errorData = await response.json();
        setLoadError(`Failed to load conversation: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setLoadError('Failed to load conversation. Please try again.');
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      // Get student ID from sessionStorage
      const storedId = sessionStorage.getItem('studentId');
      const studentId = storedId ? parseInt(storedId) : 1;
      
      const messageData = {
        content: newMessage,
        recipient_id: activeConversation.other_user.id,
        recipient_type: activeConversation.other_user.type
      };
      
      const response = await fetch(`/api/messages/student/${studentId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        // Clear input field
        setNewMessage('');
        
        // Refresh conversation to include new message
        loadConversation(activeConversation.other_user.id, activeConversation.other_user.type);
        
        // Also refresh threads to update latest message
        const threadsResponse = await fetch(`/api/messages/student/${studentId}/threads`);
        if (threadsResponse.ok) {
          const threadsData = await threadsResponse.json();
          setThreads(threadsData);
        }
      } else {
        const errorData = await response.json();
        setLoadError(`Failed to send message: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setLoadError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Generate contact initials for avatar
  const getContactInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.section}>
      <h2>Messages</h2>
      
      {loadError && (
        <div className={styles.error}>
          {loadError}
          <button 
            onClick={() => window.location.reload()} 
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      )}
      
      <div className={styles.messagesContainer}>
        {/* Conversations List */}
        <div className={styles.threadsList}>
          <div className={styles.threadsHeader}>
            <h3>Conversations</h3>
          </div>
          
          {isLoading && !activeConversation ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loading}>Loading conversations...</div>
            </div>
          ) : threads.length > 0 ? (
            <div className={styles.threads}>
              {threads.map(thread => (
                <div 
                  key={`${thread.contact_type}-${thread.contact_id}`}
                  className={`${styles.threadItem} ${
                    activeConversation?.other_user.id === thread.contact_id && 
                    activeConversation?.other_user.type === thread.contact_type ? 
                    styles.activeThread : ''
                  } ${thread.unread_count > 0 ? styles.unreadThread : ''}`}
                  onClick={() => loadConversation(thread.contact_id, thread.contact_type)}
                >
                  <div className={styles.contactAvatar}>
                    {thread.contact_profile_picture ? (
                      <div 
                        className={styles.avatarImage} 
                        style={{ backgroundImage: `url(${thread.contact_profile_picture.startsWith('data:') || thread.contact_profile_picture.startsWith('http') ? thread.contact_profile_picture : `/${thread.contact_profile_picture}`})` }}
                      />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {getContactInitials(thread.contact_name)}
                      </div>
                    )}
                    {thread.unread_count > 0 && (
                      <span className={styles.unreadBadge}>
                        {thread.unread_count > 9 ? '9+' : thread.unread_count}
                      </span>
                    )}
                  </div>
                  <div className={styles.threadInfo}>
                    <div className={styles.threadHeader}>
                      <span className={styles.contactName}>{thread.contact_name}</span>
                      <span className={styles.messageTime}>
                        {formatDate(thread.latest_message.created_at)}
                      </span>
                    </div>
                    <div className={styles.messagePreview}>
                      {thread.latest_message.sent_by_me && <span>You: </span>}
                      {thread.latest_message.content.length > 40 ? 
                        thread.latest_message.content.substring(0, 40) + '...' : 
                        thread.latest_message.content
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noMessages}>
              <div className={styles.emptyStateIcon}>💬</div>
              <p>No conversations yet</p>
              <p className={styles.noMessagesHint}>
                Start a conversation by contacting a club from the Find Clubs or Saved Clubs sections
              </p>
            </div>
          )}
        </div>
        
        {/* Conversation View */}
        <div className={styles.conversationView}>
          {activeConversation ? (
            <>
              <div className={styles.conversationHeader}>
                <div className={styles.contactInfo}>
                  <div className={styles.contactAvatar}>
                    {activeConversation.other_user.profile_picture ? (
                      <div 
                        className={styles.avatarImage} 
                        style={{ backgroundImage: `url(${activeConversation.other_user.profile_picture.startsWith('data:') || activeConversation.other_user.profile_picture.startsWith('http') ? activeConversation.other_user.profile_picture : `/${activeConversation.other_user.profile_picture}`})` }}
                      />
                    ) : (
                      <div className={styles.avatarInitials}>
                        {getContactInitials(activeConversation.other_user.name)}
                      </div>
                    )}
                  </div>
                  <h3 className={styles.contactName}>{activeConversation.other_user.name}</h3>
                </div>
                <button
                  className={styles.closeConversationButton}
                  onClick={() => setActiveConversation(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className={styles.messagesView} ref={messageContainerRef}>
                {activeConversation.messages.map((message: any) => (
                  <div 
                    key={message.id}
                    className={`${styles.message} ${message.sent_by_me ? styles.sentMessage : styles.receivedMessage}`}
                  >
                    <div className={styles.messageContent}>
                      {message.content}
                      <div className={styles.messageTime}>
                        {formatDate(message.created_at)}
                        {message.sent_by_me && (
                          <span className={styles.readStatus}>
                            {message.read ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className={styles.messageInputContainer}>
                <textarea
                  className={styles.messageInput}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <button 
                  className={styles.sendButton}
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noConversationSelected}>
              <div className={styles.emptyStateIcon}>📩</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to view messages</p>
            </div>
          )}
        </div>
      </div>
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
        {activeTab === 'messages' && <MessagesSection />}
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
        
        <button 
          className={`${styles.navButton} ${activeTab === 'messages' ? styles.active : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Messages</span>
        </button>
      </nav>
    </div>
  );
}
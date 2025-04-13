'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './clubdashboard.module.css';

// Mock club data - in a real application, this would come from an API
const mockClubData = {
  name: 'Engineering Club',
  email: 'engineering@ufl.edu',
  description: 'A club for engineering students at UF',
  interests: ['Technology', 'Science', 'Academic'],
  profilePicture: null
};

// Mock members data
const mockMembers = [
  { 
    id: 1, 
    name: 'Alice Johnson', 
    email: 'alice@ufl.edu', 
    joinDate: '2023-01-15',
    profilePicture: null 
  },
  { 
    id: 2, 
    name: 'Bob Smith', 
    email: 'bob@ufl.edu', 
    joinDate: '2023-02-03',
    profilePicture: null 
  },
  { 
    id: 3, 
    name: 'Charlie Brown', 
    email: 'charlie@ufl.edu', 
    joinDate: '2023-02-20',
    profilePicture: null 
  },
];

// Mock messages data
const mockMessages = [
  { 
    id: 1, 
    sender: 'Emily Davis', 
    email: 'emily@ufl.edu', 
    message: 'Hi, I\'m interested in joining your club. Could you tell me when the next meeting is?', 
    date: '2023-04-01T14:30:00Z',
    read: true
  },
  { 
    id: 2, 
    sender: 'David Wilson', 
    email: 'david@ufl.edu', 
    message: 'Do you have any events planned for the upcoming semester?', 
    date: '2023-04-02T09:15:00Z',
    read: false
  },
  { 
    id: 3, 
    sender: 'Michael Brown', 
    email: 'michael@ufl.edu', 
    message: 'I have experience in robotics competitions. Would that be relevant for your club?', 
    date: '2023-04-02T16:45:00Z',
    read: false
  }
];

// Profile Section Component
const ProfileSection = () => {
  const [clubData, setClubData] = useState({
    name: '',
    email: '',
    description: '',
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
  const MAX_DESCRIPTION_LENGTH = 500;

  // Load club data from backend
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setIsDataLoading(true);
        setLoadError('');
        // Get club ID from sessionStorage
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        const response = await fetch(`/api/profile/club/${clubId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded club data:", data);
          
          setClubData({
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
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
        console.error('Error fetching club data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchClubData();
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
  
  // Handle description change
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setClubData({...clubData, description: value});
    }
  };
  
  // Save profile changes
  const saveProfileChanges = async () => {
    setIsLoading(true);

    try {
      // Get club ID from sessionStorage
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
      
      const profileData = {
        name: clubData.name,
        description: clubData.description,
        interests: selectedInterests,
        profile_picture: profileImage
      };

      const response = await fetch(`/api/profile/club/${clubId}`, {
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

      // Update local state with new values
      setClubData({
        ...clubData,
        interests: selectedInterests,
        profilePicture: profileImage as null
      });
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Refresh data from server after 1 second (to allow database to update)
      setTimeout(async () => {
        try {
          const storedId = sessionStorage.getItem('clubId');
          const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
          const refreshResponse = await fetch(`/api/profile/club/${clubId}`);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setClubData({
              name: refreshData.name || '',
              email: refreshData.email || '',
              description: refreshData.description || '',
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

  return (
    <div className={styles.section}>
      <h2>Club Profile</h2>
      
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
              Upload Logo
            </button>
          </div>

          {/* Profile Info Section */}
          <div className={styles.profileInfoSection}>
            <div className={styles.formGroup}>
              <label>Club Name</label>
              <input 
                type="text" 
                value={clubData.name} 
                onChange={(e) => setClubData({...clubData, name: e.target.value})}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label>Email</label>
              <input 
                type="email" 
                value={clubData.email} 
                readOnly 
                className={styles.readOnlyField}
              />
              <div className={styles.inputHelp}>Email cannot be changed</div>
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.labelWithCounter}>
                <label>Description</label>
                <span className={styles.characterCounter}>
                  {clubData.description.length}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>
              <textarea 
                value={clubData.description} 
                onChange={handleDescriptionChange}
                className={styles.textarea}
                rows={4}
                placeholder="Describe your club's mission, activities, and what members can expect"
              />
              <div className={styles.inputHelp}>
                A good description helps students understand what your club is all about
              </div>
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
        <h3>Club Keywords</h3>
        <p className={styles.interestsHint}>Select all that apply to your club</p>
        
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

// Messages Section Component
const MessagesSection = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [activeMessage, setActiveMessage] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mark a message as read when opened
  const openMessage = (id: number) => {
    setActiveMessage(id);
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  // Close the active message
  const closeMessage = () => {
    setActiveMessage(null);
    setReplyText('');
  };

  // Send a reply (in a real app, this would call an API)
  const sendReply = () => {
    if (!replyText.trim() || !activeMessage) return;
    
    console.log(`Sending reply to message #${activeMessage}: ${replyText}`);
    
    // Remove the message from the list
    const updatedMessages = messages.filter(msg => msg.id !== activeMessage);
    setMessages(updatedMessages);
    setReplyText('');
    setActiveMessage(null);
    
    // Show success message briefly
    setSuccessMessage('Reply sent successfully!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Get the active message object
  const currentMessage = activeMessage 
    ? messages.find(msg => msg.id === activeMessage) 
    : null;

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.section}>
      <h2>Student Messages</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      {messages.length > 0 ? (
        <>
          {!activeMessage ? (
            <div className={styles.messagesList}>
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`${styles.messageItem} ${!message.read ? styles.unread : ''}`}
                  onClick={() => openMessage(message.id)}
                >
                  <div className={styles.messageSender}>
                    {!message.read && <span className={styles.unreadDot}></span>}
                    {message.sender}
                  </div>
                  <div className={styles.messagePreview}>
                    {message.message.length > 60 
                      ? message.message.substring(0, 60) + '...' 
                      : message.message
                    }
                  </div>
                  <div className={styles.messageDate}>
                    {new Date(message.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.messageDetail}>
              <div className={styles.messageHeader}>
                <button 
                  className={styles.backButton}
                  onClick={closeMessage}
                >
                  ← Back to messages
                </button>
              </div>
              
              <div className={styles.messageContent}>
                <div className={styles.messageInfo}>
                  <h3>{currentMessage?.sender}</h3>
                  <div className={styles.messageEmail}>{currentMessage?.email}</div>
                  <div className={styles.messageTime}>
                    {currentMessage?.date ? formatDate(currentMessage.date) : ''}
                  </div>
                </div>
                
                <div className={styles.messageBody}>
                  {currentMessage?.message}
                </div>
                
                <div className={styles.replyContainer}>
                  <h4>Reply</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your response here..."
                    className={styles.replyTextarea}
                    rows={4}
                  />
                  <div className={styles.replyActions}>
                    <button 
                      className={styles.sendButton}
                      onClick={sendReply}
                      disabled={!replyText.trim()}
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>📩</div>
          <p>No messages yet</p>
        </div>
      )}
    </div>
  );
};

// Members Section Component
const MembersSection = () => {
  const [members] = useState(mockMembers);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // View member details
  const viewMemberDetails = (id: number) => {
    setSelectedMember(id);
  };

  // Close member details
  const closeMemberDetails = () => {
    setSelectedMember(null);
    setMessageText('');
  };

  // Send message to member
  const sendMessageToMember = () => {
    if (!messageText.trim() || !selectedMember) return;
    
    console.log(`Sending message to member #${selectedMember}: ${messageText}`);
    setMessageText('');
    
    // Show success message briefly
    setSuccessMessage('Message sent successfully!');
    setTimeout(() => {
      setSuccessMessage('');
      closeMemberDetails();
    }, 2000);
  };

  // Get the selected member
  const currentMember = selectedMember 
    ? members.find(member => member.id === selectedMember) 
    : null;

  return (
    <div className={styles.section}>
      <h2>Club Members</h2>
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}
      
      {!selectedMember ? (
        <div className={styles.tableContainer}>
          {members.length > 0 ? (
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Join Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>
                          {member.profilePicture ? (
                            <div 
                              className={styles.avatarImage} 
                              style={{ backgroundImage: `url(${member.profilePicture})` }}
                            />
                          ) : (
                            <div className={styles.avatarInitials}>
                              {getInitials(member.name)}
                            </div>
                          )}
                        </div>
                        <div className={styles.memberName}>{member.name}</div>
                      </div>
                    </td>
                    <td>{member.email}</td>
                    <td>{new Date(member.joinDate).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className={styles.actionButton}
                        onClick={() => viewMemberDetails(member.id)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>👥</div>
              <p>No members yet</p>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.memberDetail}>
          <div className={styles.memberDetailHeader}>
            <button 
              className={styles.backButton}
              onClick={closeMemberDetails}
            >
              ← Back to members
            </button>
          </div>
          
          <div className={styles.memberDetailContent}>
            <div className={styles.memberDetailAvatar}>
              {currentMember?.profilePicture ? (
                <div 
                  className={styles.largeAvatarImage} 
                  style={{ backgroundImage: `url(${currentMember.profilePicture})` }}
                />
              ) : (
                <div className={styles.largeAvatarInitials}>
                  {getInitials(currentMember?.name || '')}
                </div>
              )}
            </div>
            
            <div className={styles.memberDetailInfo}>
              <h3>{currentMember?.name}</h3>
              <div className={styles.memberDetailEmail}>{currentMember?.email}</div>
              <div className={styles.memberDetailJoined}>
                Joined on {new Date(currentMember?.joinDate || '').toLocaleDateString()}
              </div>
              
              <div className={styles.messageContainer}>
                <h4>Send Message</h4>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className={styles.messageTextarea}
                  rows={4}
                />
                <div className={styles.messageActions}>
                  <button 
                    className={styles.sendButton}
                    onClick={sendMessageToMember}
                    disabled={!messageText.trim()}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ClubDashboard() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Club Dashboard</h1>
        <a href="/" className={styles.logoutButton}>
          Logout
        </a>
      </header>

      <main className={styles.main}>
        {activeTab === 'profile' && <ProfileSection />}
        {activeTab === 'messages' && <MessagesSection />}
        {activeTab === 'members' && <MembersSection />}
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
          className={`${styles.navButton} ${activeTab === 'messages' ? styles.active : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Messages</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${activeTab === 'members' ? styles.active : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>Members</span>
        </button>
      </nav>
    </div>
  );
}
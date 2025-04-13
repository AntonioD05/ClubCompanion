'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './clubdashboard.module.css';

// Add an interface for Member
interface Member {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  profilePicture: string | null;
}

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
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Load message threads from backend
  useEffect(() => {
    const fetchMessageThreads = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        
        // Get club ID from sessionStorage
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        
        const response = await fetch(`/api/messages/club/${clubId}/threads`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded threads:", data);
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
      
      // Get club ID from sessionStorage
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1;
      
      const response = await fetch(`/api/messages/club/${clubId}/conversation/${contactType}/${contactId}`);
      
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
      // Get club ID from sessionStorage
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1;
      
      const messageData = {
        content: newMessage,
        recipient_id: activeConversation.other_user.id,
        recipient_type: activeConversation.other_user.type
      };
      
      const response = await fetch(`/api/messages/club/${clubId}/send`, {
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
        const threadsResponse = await fetch(`/api/messages/club/${clubId}/threads`);
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
                        style={{ 
                          backgroundImage: `url('${thread.contact_profile_picture.startsWith('http') ? 
                            thread.contact_profile_picture : 
                            `/${thread.contact_profile_picture}`}')`
                        }}
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
                When students contact your club, conversations will appear here
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
                        style={{ 
                          backgroundImage: `url('${activeConversation.other_user.profile_picture.startsWith('http') ? 
                            activeConversation.other_user.profile_picture : 
                            `/${activeConversation.other_user.profile_picture}`}')`
                        }}
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

// Members Section Component
const MembersSection = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  // Fetch members data from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        
        // Get club ID from sessionStorage
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        
        const response = await fetch(`/api/club/${clubId}/members`);
        
        if (response.ok) {
          const data = await response.json();
          setMembers(data);
        } else {
          const errorData = await response.json();
          setLoadError(`Failed to load members: ${errorData.detail || 'Unknown error'}`);
          console.error('Error loading members:', errorData);
          // Fallback to empty array if API fails
          setMembers([]);
        }
      } catch (error) {
        setLoadError('Failed to connect to server. Please try again later.');
        console.error('Error fetching members:', error);
        // Fallback to empty array on error
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);
  
  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return '';
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
  const sendMessageToMember = async () => {
    if (!messageText.trim() || !selectedMember) return;
    
    try {
      // Get club ID from sessionStorage
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1;
      
      const messageData = {
        content: messageText,
        recipient_id: selectedMember,
        recipient_type: 'student'
      };
      
      const response = await fetch(`/api/messages/club/${clubId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });
      
      if (response.ok) {
        // Show success message briefly
        setSuccessMessage('Message sent successfully!');
        setMessageText('');
        
        setTimeout(() => {
          setSuccessMessage('');
          closeMemberDetails();
        }, 2000);
      } else {
        const errorData = await response.json();
        setLoadError(`Failed to send message: ${errorData.detail || 'Unknown error'}`);
      }
    } catch (error) {
      setLoadError('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    }
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
      
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading members...</div>
        </div>
      ) : !selectedMember ? (
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
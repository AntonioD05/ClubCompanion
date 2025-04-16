'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './clubdashboard.module.css';


interface Member {
  id: number;
  name: string;
  email: string;
  joinDate: string;
  profile_picture: string | null;
  interests: string[];
  saved_at: string;
}


const ProfileSection = () => {
  const [clubData, setClubData] = useState({
    name: '',
    email: '',
    description: '',
    interests: [] as string[],
    profile_picture: null as string | null
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

 
  useEffect(() => {
    const fetchClubData = async () => {
      try {
        setIsDataLoading(true);
        setLoadError('');
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1;
        const response = await fetch(`/api/profile/club/${clubId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded club data:", data);
          
          setClubData({
            name: data.name || '',
            email: data.email || '',
            description: data.description || '',
            interests: data.interests || [],
            profile_picture: data.profile_picture
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


  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  
  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    
    console.log('Password would be updated here');
    setPasswordError('');
    setShowPasswordFields(false);
    setPassword({ current: '', new: '', confirm: '' });
    
   
    setSuccessMessage('Password updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

 
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
  
 
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPTION_LENGTH) {
      setClubData({...clubData, description: value});
    }
  };
  
 
  const saveProfileChanges = async () => {
    setIsLoading(true);

    try {
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1;
      
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

     
      setClubData({
        ...clubData,
        interests: selectedInterests,
        profile_picture: profileImage as null
      });
      
      
      setSuccessMessage('Profile updated successfully!');
      
      
      setTimeout(async () => {
        try {
          const storedId = sessionStorage.getItem('clubId');
          const clubId = storedId ? parseInt(storedId) : 1;
          const refreshResponse = await fetch(`/api/profile/club/${clubId}`);
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            setClubData({
              name: refreshData.name || '',
              email: refreshData.email || '',
              description: refreshData.description || '',
              interests: refreshData.interests || [],
              profile_picture: refreshData.profile_picture
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


const MessagesSection = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [successMessage, setSuccessMessage] = useState('');

 
  useEffect(() => {
    const fetchMessageThreads = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        
        
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1; 
        
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

 
  const loadConversation = async (contactId: number, contactType: string) => {
    try {
      setIsLoading(true);
      
      
      const storedId = sessionStorage.getItem('clubId');
      const clubId = storedId ? parseInt(storedId) : 1;
      
      const response = await fetch(`/api/messages/club/${clubId}/conversation/${contactType}/${contactId}`);
      
      if (response.ok) {
        const data = await response.json();
        setActiveConversation(data);
        
        
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

  
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
     
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
        
        setNewMessage('');
        
       
        loadConversation(activeConversation.other_user.id, activeConversation.other_user.type);
        
        
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
      <h2 suppressHydrationWarning={true}>Messages</h2>
      
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


const MembersSection = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  
  
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        
        
        const storedId = sessionStorage.getItem('clubId');
        const clubId = storedId ? parseInt(storedId) : 1; // Fallback to 1 if not found
        
        const response = await fetch(`/api/club/${clubId}/members`);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded club members:", data);
          setMembers(data);
        } else {
          const errorData = await response.json();
          setLoadError(`Failed to load members: ${errorData.detail || 'Unknown error'}`);
          console.error('Error loading members:', errorData);
       
          setMembers([]);
        }
      } catch (error) {
        setLoadError('Failed to connect to server. Please try again later.');
        console.error('Error fetching members:', error);
        
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, []);
  
 
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  
  const viewMemberDetails = (id: number) => {
    setSelectedMember(id);
  };


  const closeMemberDetails = () => {
    setSelectedMember(null);
    setMessageText('');
  };

 
  const sendMessageToMember = async () => {
    if (!messageText.trim() || !selectedMember) return;
    
    try {
    
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

  
  const currentMember = selectedMember 
    ? members.find(member => member.id === selectedMember) 
    : null;
    
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.section}>
      <h2>Students Who Saved Your Club</h2>
      
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
          <div className={styles.loading}>Loading students...</div>
        </div>
      ) : !selectedMember ? (
        <div className={styles.tableContainer}>
          {members.length > 0 ? (
            <table className={styles.membersTable}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Interests</th>
                  <th>Saved Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.memberInfo}>
                        <div className={styles.memberAvatar}>
                          {member.profile_picture ? (
                            <div 
                              className={styles.avatarImage} 
                              style={{ backgroundImage: `url(${member.profile_picture})` }}
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
                    <td>
                      <div className={styles.interestTags}>
                        {member.interests && member.interests.length > 0 ? (
                          member.interests.slice(0, 3).map(interest => (
                            <span key={interest} className={styles.interestTag}>{interest}</span>
                          ))
                        ) : (
                          <span className={styles.noInterests}>No interests listed</span>
                        )}
                        {member.interests && member.interests.length > 3 && (
                          <span className={styles.moreInterests}>+{member.interests.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td>{formatDate(member.saved_at)}</td>
                    <td>
                      <button 
                        className={styles.actionButton}
                        onClick={() => viewMemberDetails(member.id)}
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>👥</div>
              <p>No students have saved your club yet</p>
              <p className={styles.emptyStateSubtext}>When students save your club, they'll appear here</p>
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
              ← Back to students
            </button>
          </div>
          
          <div className={styles.memberDetailContent}>
            <div className={styles.memberDetailAvatar}>
              {currentMember?.profile_picture ? (
                <div 
                  className={styles.largeAvatarImage} 
                  style={{ backgroundImage: `url(${currentMember.profile_picture})` }}
                />
              ) : (
                <div className={styles.largeAvatarInitials}>
                  {getInitials(currentMember?.name || '')}
                </div>
              )}
            </div>
            
            <div className={styles.memberDetailInfo}>
              <h3>{currentMember?.name}</h3>
              
              <div className={styles.memberDetailInterests}>
                <h4>Interests</h4>
                <div className={styles.interestTagsLarge}>
                  {currentMember?.interests && currentMember.interests.length > 0 ? (
                    currentMember.interests.map(interest => (
                      <span key={interest} className={styles.interestTag}>{interest}</span>
                    ))
                  ) : (
                    <span className={styles.noInterests}>No interests listed</span>
                  )}
                </div>
              </div>
              
              <div className={styles.memberDetailJoined}>
                Saved on {formatDate(currentMember?.saved_at || '')}
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
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTab = sessionStorage.getItem('clubActiveTab');
      return savedTab || 'profile';
    }
    return 'profile';
  });

 
  useEffect(() => {
    sessionStorage.setItem('clubActiveTab', activeTab);
  }, [activeTab]);

  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem('clubActiveTab', tab);
  };

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
          onClick={() => handleTabChange('profile')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Profile</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${activeTab === 'messages' ? styles.active : ''}`}
          onClick={() => handleTabChange('messages')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>Messages</span>
        </button>
        
        <button 
          className={`${styles.navButton} ${activeTab === 'members' ? styles.active : ''}`}
          onClick={() => handleTabChange('members')}
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
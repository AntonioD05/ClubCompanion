'use client';

import { useState } from 'react';
import { default as Link } from 'next/link';
import styles from './studentdashboard.module.css';

// Placeholder components for each section
const ProfileSection = () => (
  <div className={styles.section}>
    <h2>My Profile</h2>
    <p>Your profile information will appear here.</p>
  </div>
);

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
        <Link href="/" className={styles.logoutButton}>
          Logout
        </Link>
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
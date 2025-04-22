'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

/**
 * Available interest options for both students and clubs
 * These are used to populate the interest selection interface
 */
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

/**
 * Interface defining the structure of registration data
 * This is used for type checking when submitting the registration form
 */
interface RegisterData {
  email: string;
  password: string;
  name: string;
  description?: string;
  interests: string[];
}

/**
 * Register Component
 * 
 * This component handles user registration for both students and clubs.
 * It includes form validation, interest selection, and API integration.
 * 
 * @returns {JSX.Element} The registration form with all necessary fields
 */
export default function Register() {
  const router = useRouter();
  const [isClub, setIsClub] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    description: '',
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [error, setError] = useState('');

  /**
   * Toggles the selection of an interest
   * @param {string} interest - The interest to toggle
   */
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  /**
   * Handles form submission
   * Validates input and sends registration data to the API
   * @param {React.FormEvent} e - The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate UF email for students
    if (!isClub && !formData.email.endsWith('@ufl.edu')) {
      setError('Please use a valid UF email address (@ufl.edu)');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate interests selection
    if (selectedInterests.length === 0) {
      setError('Please select at least one interest');
      return;
    }

    // Prepare registration data
    const registerData: RegisterData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      interests: selectedInterests
    };

    // Add description for club registration
    if (isClub && formData.description) {
      registerData.description = formData.description;
    }

    try {
      // Send registration request to API
      const response = await fetch(`/api/register/${isClub ? 'club' : 'student'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Redirect to appropriate login page on success
      router.push(`/login/${isClub ? 'club' : 'student'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className={styles.page} suppressHydrationWarning>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <main className={styles.main}>
        <a href="/" className={styles.backButton}>
          ← Back
        </a>
        <div className={styles.registerContainer}>
          <h1>Create Account</h1>
          
          {/* Account type toggle (Student/Club) */}
          <div className={styles.toggleContainer}>
            <span className={!isClub ? styles.activeType : styles.accountType}>Student</span>
            <button 
              onClick={() => setIsClub(!isClub)} 
              className={`${styles.switch} ${isClub ? styles.switchActive : ''}`}
              suppressHydrationWarning
            >
              <span className={styles.slider} />
            </button>
            <span className={isClub ? styles.activeType : styles.accountType}>Club</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          {/* Main registration form */}
          <form onSubmit={handleSubmit} className={styles.form} suppressHydrationWarning>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email {!isClub && "(UF email required)"}</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* Name input field */}
            <div className={styles.formGroup}>
              <label htmlFor="name">{isClub ? 'Club Name' : 'Full Name'}</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            {/* Club description field (only shown for club registration) */}
            {isClub && (
              <div className={styles.formGroup}>
                <label htmlFor="description">Club Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your club's mission, activities, and what members can expect"
                />
              </div>
            )}

            {/* Interests selection section */}
            <div className={styles.formGroup}>
              <label>{isClub ? 'Club Keywords' : 'Interests'}</label>
              <p className={styles.interestsHint}>Select all that apply</p>
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

            {/* Password input fields */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
              />
            </div>

            {/* Submit button */}
            <button type="submit" className={styles.submitButton} suppressHydrationWarning>
              Create Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 
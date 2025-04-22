'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

/**
 * ClubLogin Component
 * 
 * This component handles club authentication by providing a login form
 * that validates credentials against the backend API. Upon successful login,
 * it stores the club ID and email in session storage and redirects to
 * the club dashboard.
 */
export default function ClubLogin() {
  // Initialize hooks and state
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles form submission
   * Sends login credentials to the API and processes the response
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Send login request to API
      const response = await fetch('/api/login/club', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Incorrect email or password');
        return; 
      }

      
      sessionStorage.setItem('clubId', data.id.toString());
      sessionStorage.setItem('userEmail', email);
      
    
      router.push('/dashboard/club');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <main className={styles.main}>
        <a href="/" className={styles.backButton}>
          ← Back
        </a>

        {/* Login form container */}
        <div className={styles.loginContainer}>
          <h1>Club Login</h1>
          
          {error && <div className={styles.error}>{error}</div>}

          {/* Main login form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password input field */}
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Submit button with loading state */}
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 
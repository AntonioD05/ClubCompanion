'use client';
import { useState } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';

/**
 * StudentLogin Component
 * 
 * This component handles student authentication by providing a login form
 * that validates credentials against the backend API. Upon successful login,
 * it stores the student ID and email in session storage and redirects to
 * the student dashboard.
 * 

 */
export default function StudentLogin() {
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
      const response = await fetch('/api/login/student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Store user data in session storage
      sessionStorage.setItem('studentId', data.id.toString());
      sessionStorage.setItem('userEmail', email);

      // Redirect to student dashboard
      router.push('/dashboard/student');
    } catch (err) {
      setError('Incorrect email or password');
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
          <h1>Student Login</h1>
          
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
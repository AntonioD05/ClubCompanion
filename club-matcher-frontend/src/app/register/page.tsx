'use client';
import { useState } from 'react';
import styles from './page.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  description?: string;
  interests: string[];
}

export default function Register() {
  const router = useRouter();
  const [isClub, setIsClub] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    description: '',
    interests: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Add UF email validation for students
    if (!isClub && !formData.email.endsWith('@ufl.edu')) {
      setError('Please use a valid UF email address (@ufl.edu)');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Convert comma-separated interests to array
    const interests = formData.interests.split(',').map(i => i.trim()).filter(i => i);

    const registerData: RegisterData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      interests: interests
    };

    if (isClub && formData.description) {
      registerData.description = formData.description;
    }

    try {
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

      // Registration successful
      router.push(`/login/${isClub ? 'club' : 'student'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
        <Link href="/" className={styles.backButton}>
          ← Back
        </Link>
        <div className={styles.registerContainer}>
          <h1>Create Account</h1>
          
          <div className={styles.toggleContainer}>
            <span className={!isClub ? styles.activeType : styles.accountType}>Student</span>
            <button 
              onClick={() => setIsClub(!isClub)} 
              className={`${styles.switch} ${isClub ? styles.switchActive : ''}`}
            >
              <span className={styles.slider} />
            </button>
            <span className={isClub ? styles.activeType : styles.accountType}>Club</span>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
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

            {isClub && (
              <div className={styles.formGroup}>
                <label htmlFor="description">Club Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="interests">
                {isClub ? 'Club Keywords (separate with commas)' : 'Interests (separate with commas)'}
              </label>
              <textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                required
                placeholder="e.g., Technology, Sports, Art"
              />
            </div>

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

            <button type="submit" className={styles.submitButton}>
              Create Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
} 
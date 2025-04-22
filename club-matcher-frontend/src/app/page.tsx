import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* Background decorative shapes */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      {/* Main content section */}
      <main className={styles.main}>
        {/* Header section with title and description */}
        <div className={styles.header}>
          <h1>Welcome to Club Companion</h1>
          <p>Find your perfect club match at the University of Florida</p>
        </div>

        {/* Login options container */}
        <div className={styles.loginContainer}>
          <h2>Choose your account type</h2>
          
          <div className={styles.loginOptions}>
            {/* Student login button */}
            <a href="/login/student" className={styles.loginButton}>
              <img
                src="/student-icon.svg"
                alt="Student Icon"
                width={24}
                height={24}
                className={styles.buttonIcon}
              />
              Login as Student
            </a>

            {/* Club login button */}
            <a href="/login/club" className={styles.loginButton}>
              <img
                src="/club-icon.svg"
                alt="Club Icon"
                width={24}
                height={24}
                className={styles.buttonIcon}
              />
              Login as Club
            </a>
          </div>

          {/* Registration link for new users */}
          <p className={styles.registerText}>
            Don&apos;t have an account?{" "}
            <a href="/register" className={styles.registerLink}>
              Register here
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

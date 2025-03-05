import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.backgroundShapes}>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
        <div className={styles.shape}></div>
      </div>
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Welcome to Club Companion</h1>
          <p>Find your perfect club match at the University of Florida</p>
        </div>

        <div className={styles.loginContainer}>
          <h2>Choose your account type</h2>
          
          <div className={styles.loginOptions}>
            <Link href="/login/student" className={styles.loginButton}>
              <Image
                src="/student-icon.svg"
                alt="Student Icon"
                width={24}
                height={24}
                className={styles.buttonIcon}
              />
              Login as Student
            </Link>

            <Link href="/login/club" className={styles.loginButton}>
              <Image
                src="/club-icon.svg"
                alt="Club Icon"
                width={24}
                height={24}
                className={styles.buttonIcon}
              />
              Login as Club
            </Link>
          </div>

          <p className={styles.registerText}>
            Don&apos;t have an account?{" "}
            <Link href="/register" className={styles.registerLink}>
              Register here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

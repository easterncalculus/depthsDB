import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>DepthsDB - Card Game Database</title>
        <meta name="description" content="Database for card game" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to DepthsDB</h1>

        <p className={styles.description}>
          Your comprehensive card game database
        </p>

        <div className={styles.grid}>
          <Link href="/cards" className={styles.card}>
            <h2>Card Library &rarr;</h2>
            <p>Browse all cards in the database.</p>
          </Link>

          <Link href="/cards/create" className={styles.card}>
            <h2>Add New Card &rarr;</h2>
            <p>Create a new card entry in the database.</p>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          DepthsDB - Card Game Database
        </a>
      </footer>
    </div>
  );
}
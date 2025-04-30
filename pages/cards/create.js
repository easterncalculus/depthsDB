import Head from 'next/head';
import Link from 'next/link';
import CardForm from '../../components/CardForm';
import styles from '../../styles/Home.module.css';

export default function CreateCard() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create New Card | DepthsDB</title>
        <meta name="description" content="Add a new card to the database" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Create New Card</h1>
        
        <div className={styles.grid}>
          <Link href="/cards" className={styles.card}>
            <h2>&larr; Back to Card Library</h2>
          </Link>
        </div>

        <CardForm />
      </main>
    </div>
  );
}
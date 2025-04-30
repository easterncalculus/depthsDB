import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CardForm from '../../../components/CardForm';
import styles from '../../../styles/Home.module.css';

export default function EditCard() {
  const router = useRouter();
  const { id } = router.query;
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchCard();
    }
  }, [id]);

  const fetchCard = async () => {
    try {
      const response = await fetch(`/api/cards/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch card');
      }
      const data = await response.json();
      setCardData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!id) return null; 
  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>Edit Card | DepthsDB</title>
        <meta name="description" content="Edit card in the database" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Edit Card</h1>
        
        <div className={styles.grid}>
          <Link href="/cards" className={styles.card}>
            <h2>&larr; Back to Card Library</h2>
          </Link>
        </div>

        <CardForm initialData={cardData} />
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import CardDisplay from '../../../components/CardDisplay';
import styles from '../../../styles/Home.module.css';

export default function CardDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCard = async () => {
      if (!router.isReady) return;
      
      try {
        const response = await fetch(`/api/cards/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Card not found');
          } else {
            throw new Error('Failed to fetch card');
          }
        } else {
          const data = await response.json();
          setCard(data);
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCard();
  }, [router.isReady, id]);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        const response = await fetch(`/api/cards/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete card');
        }

        router.push('/cards');
      } catch (err) {
        console.error('Error deleting card:', err);
        alert('Failed to delete card');
      }
    }
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{card.name} | DepthsDB</title>
        <meta name="description" content={`View details for ${card.name}`} />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{card.name}</h1>

        <div className={styles.actions}>
          <Link href="/cards" className={styles.button}>
            Back to Cards
          </Link>
          <Link href={`/cards/${id}/edit`} className={styles.button}>
            Edit Card
          </Link>
          <button onClick={handleDelete} className={styles.deleteButton}>
            Delete Card
          </button>
        </div>

        <div className={styles.cardDetailContainer}>
          <CardDisplay card={card} />
        </div>

        <div className={styles.metadata}>
          <p>Created: {new Date(card.createdAt).toLocaleString()}</p>
          <p>Last Updated: {new Date(card.updatedAt).toLocaleString()}</p>
        </div>
      </main>
    </div>
  );
}
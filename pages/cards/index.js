import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/Home.module.css';

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data = await response.json();
        setCards(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this card?')) {
      try {
        const response = await fetch(`/api/cards/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete card');
        }

        setCards(cards.filter(card => card.id !== id));
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
        <title>Card Library | DepthsDB</title>
        <meta name="description" content="Browse all cards in the database" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Card Library</h1>

        <div className={styles.grid}>
          <Link href="/" className={styles.card}>
            <h2>&larr; Back to Home</h2>
          </Link>
          
          <Link href="/cards/create" className={styles.card}>
            <h2>Add New Card &rarr;</h2>
          </Link>
        </div>

        {cards.length === 0 ? (
          <p className={styles.description}>No cards found. Create one!</p>
        ) : (
          <div className={styles.grid}>
            {cards.map(card => (
              <div key={card.id} className={styles.card}>
                <h2>{card.name}</h2>
                <p>Side: {card.side} | Type: {card.type}</p>
                <p>{card.description}</p>
                <div>
                  <Link href={`/cards/${card.id}/edit`} style={{ marginRight: '1rem' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(card.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
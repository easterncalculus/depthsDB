import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';

export default function Cards() {
  const router = useRouter();
  const { side, type } = router.query;
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      if (!router.isReady) return;
      
      try {
        // Build the query string for filtering
        let queryString = '';
        if (side || type) {
          queryString = '?';
          if (side) queryString += `side=${side}`;
          if (type) queryString += `${side ? '&' : ''}type=${type}`;
        }
        
        const response = await fetch(`/api/cards${queryString}`);
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
  }, [router.isReady, side, type]);

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

  // Generate page title based on filters
  const getPageTitle = () => {
    if (side && type) {
      return `${side} ${type} Cards`;
    } else if (side) {
      return `${side} Cards`;
    } else if (type) {
      return `${type} Cards`;
    }
    return 'All Cards';
  };

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <Head>
        <title>{getPageTitle()} | DepthsDB</title>
        <meta name="description" content={`Browse ${getPageTitle().toLowerCase()} in the database`} />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{getPageTitle()}</h1>

        <div className={styles.actions}>
          <Link href="/" className={styles.button}>
            Back to Index
          </Link>
          <Link href="/cards/create" className={styles.button}>
            Add New Card
          </Link>
        </div>

        {cards.length === 0 ? (
          <p className={styles.description}>No cards found matching your criteria.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.cardsTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  {!side && <th>Side</th>}
                  {!type && <th>Type</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map(card => (
                  <tr key={card.id}>
                    <td>{card.name}</td>
                    <td className={styles.descriptionCell}>{card.description.substring(0, 100)}{card.description.length > 100 ? '...' : ''}</td>
                    {!side && <td>{card.side}</td>}
                    {!type && <td>{card.type}</td>}
                    <td className={styles.actionCell}>
                      <Link href={`/cards/${card.id}`} className={styles.linkButton}>
                        View
                      </Link>
                      <Link href={`/cards/${card.id}/edit`} className={styles.linkButton}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(card.id)} className={styles.deleteButton}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
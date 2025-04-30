import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../../styles/Home.module.css';
import SearchBar from '../../components/SearchBar';
import { CardSide, CardType } from '../../types/card';
import CardDisplay from '../../components/CardDisplay';

export default function Cards() {
  const router = useRouter();
  const { side: initialSide, type: initialType, search: initialSearch } = router.query;
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');
  const [selectedSide, setSelectedSide] = useState(initialSide || '');
  const [selectedType, setSelectedType] = useState(initialType || '');

  // Fetch cards whenever filters change
  useEffect(() => {
    const fetchCards = async () => {
      if (!router.isReady) return;
      
      setLoading(true);
      
      try {
        // Build the query string for filtering
        const params = new URLSearchParams();
        if (selectedSide) params.append('side', selectedSide);
        if (selectedType) params.append('type', selectedType);
        if (searchTerm) params.append('search', searchTerm);
        
        const queryString = params.toString() ? `?${params.toString()}` : '';
        
        const response = await fetch(`/api/cards${queryString}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cards');
        }
        const data = await response.json();
        setCards(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching cards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [router.isReady, selectedSide, selectedType, searchTerm]);

  // Update URL when filters change
  useEffect(() => {
    if (!router.isReady) return;
    
    const params = new URLSearchParams();
    if (selectedSide) params.append('side', selectedSide);
    if (selectedType) params.append('type', selectedType);
    if (searchTerm) params.append('search', searchTerm);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    // Replace URL without reloading the page
    router.replace(`/cards${queryString}`, undefined, { shallow: true });
  }, [selectedSide, selectedType, searchTerm, router.isReady]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleSideChange = (e) => {
    setSelectedSide(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

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
    let title = 'Cards';
    
    if (selectedSide && selectedType) {
      title = `${selectedSide} ${selectedType} Cards`;
    } else if (selectedSide) {
      title = `${selectedSide} Cards`;
    } else if (selectedType) {
      title = `${selectedType} Cards`;
    }
    
    if (searchTerm) {
      title += ` matching "${searchTerm}"`;
    }
    
    return title;
  };

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
        
        {/* Search and Filters */}
        <SearchBar 
          onSearch={handleSearch} 
          placeholder="Search by card name..." 
        />
        
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroup}>
            <label htmlFor="sideFilter">Card Side:</label>
            <select
              id="sideFilter"
              value={selectedSide}
              onChange={handleSideChange}
            >
              <option value="">All Sides</option>
              <option value={CardSide.HERO}>Hero</option>
              <option value={CardSide.DUNGEON}>Dungeon</option>
              <option value={CardSide.NEUTRAL}>Neutral</option>
            </select>
          </div>
          
          <div className={styles.filterGroup}>
            <label htmlFor="typeFilter">Card Type:</label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={handleTypeChange}
            >
              <option value="">All Types</option>
              <option value={CardType.HERO_IDENTITY}>Hero Identity</option>
              <option value={CardType.HERO_ASSET}>Hero Asset</option>
              <option value={CardType.HERO_EVENT}>Hero Event</option>
              <option value={CardType.DUNGEON_FORM}>Dungeon Form</option>
              <option value={CardType.DUNGEON_VARIANT}>Dungeon Variant</option>
              <option value={CardType.DUNGEON_ROOM}>Dungeon Room</option>
              <option value={CardType.NEUTRAL_INFO}>Neutral Info</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading cards...</div>
        ) : error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : cards.length === 0 ? (
          <p className={styles.description}>No cards found matching your criteria.</p>
        ) : (
          <div className={styles.indexContainer}>
                <div className={styles.cardGrid}>
                  {cards.map(card => (
                    <div key={card.id} >
                      <CardDisplay card={card} showActions={true} />
                    </div>
                  ))}
                </div>
          </div>
          // <div className={styles.tableContainer}>
          //   <table className={styles.cardsTable}>
          //     <thead>
          //       <tr>
          //         <th>Name</th>
          //         <th>Description</th>
          //         {!selectedSide && <th>Side</th>}
          //         {!selectedType && <th>Type</th>}
          //         <th>Actions</th>
          //       </tr>
          //     </thead>
          //     <tbody>
          //       {cards.map(card => (
          //         <tr key={card.id}>
          //           <td>{card.name}</td>
          //           <td className={styles.descriptionCell}>{card.description.substring(0, 100)}{card.description.length > 100 ? '...' : ''}</td>
          //           {!selectedSide && <td>{card.side}</td>}
          //           {!selectedType && <td>{card.type}</td>}
          //           <td className={styles.actionCell}>
          //             <Link href={`/cards/${card.id}`} className={styles.linkButton}>
          //               View
          //             </Link>
          //             <Link href={`/cards/${card.id}/edit`} className={styles.linkButton}>
          //               Edit
          //             </Link>
          //             <button onClick={() => handleDelete(card.id)} className={styles.deleteButton}>
          //               Delete
          //             </button>
          //           </td>
          //         </tr>
          //       ))}
          //     </tbody>
          //   </table>
          // </div>
        )}
      </main>
    </div>
  );
}
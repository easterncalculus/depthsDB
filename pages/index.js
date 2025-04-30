import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import styles from '../styles/Home.module.css';
import { CardSide, CardType } from '../types/card';

export default function Home() {
  const [selectedSide, setSelectedSide] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Define available sides
  const sides = [
    { id: CardSide.HERO, label: 'Hero' },
    { id: CardSide.DUNGEON, label: 'Dungeon' },
    { id: CardSide.NEUTRAL, label: 'Neutral' }
  ];

  // Get available types based on selected side
  const getCardTypes = (side) => {
    switch(side) {
      case CardSide.HERO:
        return [
          { id: CardType.HERO_IDENTITY, label: 'Hero Identity' },
          { id: CardType.HERO_ASSET, label: 'Hero Asset' },
          { id: CardType.HERO_EVENT, label: 'Hero Event' }
        ];
      case CardSide.DUNGEON:
        return [
          { id: CardType.DUNGEON_FORM, label: 'Dungeon Form' },
          { id: CardType.DUNGEON_VARIANT, label: 'Dungeon Variant' },
          { id: CardType.DUNGEON_ROOM, label: 'Dungeon Room' }
        ];
      case CardSide.NEUTRAL:
        return [
          { id: CardType.NEUTRAL_INFO, label: 'Neutral Info' }
        ];
      default:
        return [];
    }
  };

  // Handle side selection
  const handleSideSelect = (side) => {
    setSelectedSide(side);
    setSelectedType(null); // Reset type when side changes
  };

  // Handle type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  // Build query string for card filtering
  const getFilterQueryString = () => {
    let query = '?';
    if (selectedSide) query += `side=${selectedSide}`;
    if (selectedType) query += `&type=${selectedType}`;
    return query;
  };

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

        <div className={styles.actions}>
          <Link href="/cards/create">
            <span className={styles.button}>Add New Card</span>
          </Link>
          <Link href="/rules/create">
            <span className={styles.button}>Add New Rule</span>
          </Link>
          <Link href="/rules">
            <span className={styles.button}>View Game Rules</span>
          </Link>
        </div>

        <div className={styles.indexContainer}>
          <div className={styles.sideSelection}>
            <h2>Browse Cards by Side</h2>
            <div className={styles.cardGrid}>
              {sides.map((side) => (
                <div 
                  key={side.id}
                  className={`${styles.sideCard} ${selectedSide === side.id ? styles.selected : ''}`}
                  onClick={() => handleSideSelect(side.id)}
                >
                  <h3>{side.label}</h3>
                </div>
              ))}
            </div>
          </div>

          {selectedSide && (
            <div className={styles.typeSelection}>
              <h2>Select Card Type</h2>
              <div className={styles.cardGrid}>
                {getCardTypes(selectedSide).map((type) => (
                  <div 
                    key={type.id}
                    className={`${styles.typeCard} ${selectedType === type.id ? styles.selected : ''}`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <h3>{type.label}</h3>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedType && (
            <div className={styles.browseAction}>
              <Link 
                href={`/cards${getFilterQueryString()}`}
              >
                <span className={styles.button}>Browse Cards</span>
              </Link>
            </div>
          )}
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
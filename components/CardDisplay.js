import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import { CardSide, CardType } from '../types/card';
import ReferenceText from './ReferenceText';

const CardDisplay = ({ card }) => {
  // Common card display elements
  const renderCommonInfo = () => (
    <>
      <Link href={`/cards/${card.id}`}><h2>{card.name}</h2></Link>
      <div className={styles.cardMeta}>
        <span>Side: {card.side}</span> • <span>Type: {card.type}</span>
        {card.subtypes && card.subtypes.length > 0 && (
          <> • <span>Subtypes: {card.subtypes.join(', ')}</span></>
        )}
      </div>
      <div className={styles.cardDescription}>
        <ReferenceText text={card.description} references={card.references} />
      </div>
    </>
  );

  // Render fields specific to hero cards
  const renderHeroFields = () => {
    if (card.side !== CardSide.HERO) return null;
    
    return (
      <div className={styles.cardSpecial}>
        <p>Archetype: {card.heroArchetype}</p>
        {card.type === CardType.HERO_EVENT && (
          <p>Mana Cost: {card.manaCost}</p>
        )}
      </div>
    );
  };

  // Render fields specific to dungeon cards
  const renderDungeonFields = () => {
    if (card.side !== CardSide.DUNGEON) return null;
    
    return (
      <div className={styles.cardSpecial}>
        <p>Archetype: {card.dungeonArchetype}</p>
        {card.type === CardType.DUNGEON_ROOM && card.exits && (
          <p>Exits: {card.exits.join(', ')}</p>
        )}
      </div>
    );
  };

  // Render card image if available
  const renderCardImage = () => {
    if (!card.imageUrl) return null;
    
    return (
      <div className={styles.cardImage}>
        <img src={card.imageUrl} alt={card.name} />
      </div>
    );
  };

  return (
    <div className={`${styles.cardDisplay} ${styles[`card${card.side}`]} ${styles.cardItem}`}>
      {renderCardImage()}
      <div className={styles.cardContent}>
        {renderCommonInfo()}
        {renderHeroFields()}
        {renderDungeonFields()}
      </div>
    </div>
  );
};

export default CardDisplay;
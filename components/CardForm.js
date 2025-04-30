import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css';

const CardSide = {
  DUNGEON: 'dungeon',
  HERO: 'hero',
  NEUTRAL: 'neutral'
};

const CardType = {
  HERO_IDENTITY: 'heroIdentity',
  HERO_ASSET: 'heroAsset',
  HERO_EVENT: 'heroEvent',
  DUNGEON_FORM: 'dungeonForm',
  DUNGEON_VARIANT: 'dungeonVariant',
  DUNGEON_ROOM: 'dungeonRoom',
  NEUTRAL_INFO: 'neutralInfo'
};

const HeroArchetype = {
  WARRIOR: 'warrior',
  MAGE: 'mage',
  ADVENTURER: 'adventurer'
};

const DungeonArchetype = {
  MAZE: 'maze',
  TOMB: 'tomb',
  FORTRESS: 'fortress',
  CAVERN: 'cavern'
};

const ExitType = {
  NORTH: 'North',
  EAST: 'East',
  SOUTH: 'South',
  WEST: 'West',
  SPECIAL: 'Special'
};

export default function CardForm({ initialData }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    side: initialData?.side || '',
    type: initialData?.type || '',
    subtypes: initialData?.subtypes?.join(', ') || '',
    heroArchetype: initialData?.heroArchetype || '',
    manaCost: initialData?.manaCost || '',
    dungeonArchetype: initialData?.dungeonArchetype || '',
    exits: initialData?.exits?.join(', ') || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [availableTypes, setAvailableTypes] = useState([]);
  const [showHeroFields, setShowHeroFields] = useState(false);
  const [showDungeonFields, setShowDungeonFields] = useState(false);
  const [showManaCost, setShowManaCost] = useState(false);
  const [showExits, setShowExits] = useState(false);

  // Update available card types based on selected side
  useEffect(() => {
    let types = [];
    
    if (formData.side === CardSide.HERO) {
      types = [
        { value: CardType.HERO_IDENTITY, label: 'Hero Identity' },
        { value: CardType.HERO_ASSET, label: 'Hero Asset' },
        { value: CardType.HERO_EVENT, label: 'Hero Event' }
      ];
      setShowHeroFields(true);
      setShowDungeonFields(false);
    } 
    else if (formData.side === CardSide.DUNGEON) {
      types = [
        { value: CardType.DUNGEON_FORM, label: 'Dungeon Form' },
        { value: CardType.DUNGEON_VARIANT, label: 'Dungeon Variant' },
        { value: CardType.DUNGEON_ROOM, label: 'Dungeon Room' }
      ];
      setShowHeroFields(false);
      setShowDungeonFields(true);
    } 
    else if (formData.side === CardSide.NEUTRAL) {
      types = [
        { value: CardType.NEUTRAL_INFO, label: 'Neutral Info' }
      ];
      setShowHeroFields(false);
      setShowDungeonFields(false);
    } 
    else {
      setShowHeroFields(false);
      setShowDungeonFields(false);
    }
    
    setAvailableTypes(types);
    
    // Reset type if it's not compatible with the selected side
    if (formData.side && formData.type && !types.find(t => t.value === formData.type)) {
      setFormData(prev => ({ ...prev, type: '' }));
    }
  }, [formData.side]);

  // Show/hide specific fields based on card type
  useEffect(() => {
    setShowManaCost(formData.type === CardType.HERO_EVENT);
    setShowExits(formData.type === CardType.DUNGEON_ROOM);
  }, [formData.type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Process the form data before submitting
      const processedData = {
        ...formData,
        subtypes: formData.subtypes ? formData.subtypes.split(',').map(s => s.trim()) : [],
      };

      // Only include side-specific fields that are relevant
      if (formData.side === CardSide.HERO) {
        if (formData.type === CardType.HERO_EVENT) {
          processedData.manaCost = parseInt(formData.manaCost) || 0;
        }
      } else if (formData.side === CardSide.DUNGEON) {
        if (formData.type === CardType.DUNGEON_ROOM) {
          processedData.exits = formData.exits 
            ? formData.exits.split(',').map(e => e.trim()) 
            : [];
        }
      }

      const url = initialData?.id ? `/api/cards/${initialData.id}` : '/api/cards';
      const method = initialData?.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error('Failed to save card');
      }

      router.push('/cards');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label htmlFor="name">Card Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="imageUrl">Image URL (optional):</label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="side">Card Side:</label>
        <select
          id="side"
          name="side"
          value={formData.side}
          onChange={handleChange}
          required
        >
          <option value="">Select a side</option>
          <option value={CardSide.HERO}>Hero</option>
          <option value={CardSide.DUNGEON}>Dungeon</option>
          <option value={CardSide.NEUTRAL}>Neutral</option>
        </select>
      </div>

      {formData.side && (
        <div className={styles.formGroup}>
          <label htmlFor="type">Card Type:</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Select a type</option>
            {availableTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label htmlFor="subtypes">Subtypes (comma-separated):</label>
        <input
          type="text"
          id="subtypes"
          name="subtypes"
          value={formData.subtypes}
          onChange={handleChange}
          placeholder="e.g. Magic, Weapon, Trap"
        />
      </div>

      {/* Hero card specific fields */}
      {showHeroFields && (
        <div className={styles.formGroup}>
          <label htmlFor="heroArchetype">Hero Archetype:</label>
          <select
            id="heroArchetype"
            name="heroArchetype"
            value={formData.heroArchetype}
            onChange={handleChange}
            required
          >
            <option value="">Select an archetype</option>
            <option value={HeroArchetype.WARRIOR}>Warrior</option>
            <option value={HeroArchetype.MAGE}>Mage</option>
            <option value={HeroArchetype.ADVENTURER}>Adventurer</option>
          </select>
        </div>
      )}

      {showManaCost && (
        <div className={styles.formGroup}>
          <label htmlFor="manaCost">Mana Cost:</label>
          <input
            type="number"
            id="manaCost"
            name="manaCost"
            value={formData.manaCost}
            onChange={handleChange}
            min="0"
            required
          />
        </div>
      )}

      {/* Dungeon card specific fields */}
      {showDungeonFields && (
        <div className={styles.formGroup}>
          <label htmlFor="dungeonArchetype">Dungeon Archetype:</label>
          <select
            id="dungeonArchetype"
            name="dungeonArchetype"
            value={formData.dungeonArchetype}
            onChange={handleChange}
            required
          >
            <option value="">Select an archetype</option>
            <option value={DungeonArchetype.MAZE}>Maze</option>
            <option value={DungeonArchetype.TOMB}>Tomb</option>
            <option value={DungeonArchetype.FORTRESS}>Fortress</option>
            <option value={DungeonArchetype.CAVERN}>Cavern</option>
          </select>
        </div>
      )}

      {showExits && (
        <div className={styles.formGroup}>
          <label htmlFor="exits">Exits (comma-separated):</label>
          <select
            id="exits"
            name="exits"
            multiple
            value={formData.exits.split(',').map(e => e.trim()).filter(e => e)}
            onChange={(e) => {
              const selectedExits = Array.from(e.target.selectedOptions, option => option.value).join(', ');
              setFormData(prev => ({ ...prev, exits: selectedExits }));
            }}
          >
            <option value={ExitType.NORTH}>North</option>
            <option value={ExitType.EAST}>East</option>
            <option value={ExitType.SOUTH}>South</option>
            <option value={ExitType.WEST}>West</option>
            <option value={ExitType.SPECIAL}>Special</option>
          </select>
          <small>Hold Ctrl/Cmd to select multiple exits</small>
        </div>
      )}

      <div className={styles.formGroup}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Card' : 'Create Card')}
        </button>
      </div>
    </form>
  );
}
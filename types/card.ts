// Card Types
export enum CardSide {
  DUNGEON = 'dungeon',
  HERO = 'hero',
  NEUTRAL = 'neutral'
}

export enum CardType {
  HERO_IDENTITY = 'heroIdentity',
  HERO_ASSET = 'heroAsset',
  HERO_EVENT = 'heroEvent',
  DUNGEON_FORM = 'dungeonForm',
  DUNGEON_VARIANT = 'dungeonVariant',
  DUNGEON_ROOM = 'dungeonRoom',
  NEUTRAL_INFO = 'neutralInfo'
}

export enum HeroArchetype {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ADVENTURER = 'adventurer'
}

export enum DungeonArchetype {
  MAZE = 'maze',
  TOMB = 'tomb',
  FORTRESS = 'fortress',
  CAVERN = 'cavern'
}

export enum ExitType {
  NORTH = 'North',
  EAST = 'East',
  SOUTH = 'South',
  WEST = 'West',
  SPECIAL = 'Special'
}

// Base Card Interface
export interface BaseCard {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  side: CardSide;
  type: CardType;
  subtypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hero Card Types
export interface HeroCard extends BaseCard {
  side: CardSide.HERO;
  type: CardType.HERO_IDENTITY | CardType.HERO_ASSET | CardType.HERO_EVENT;
  heroArchetype: HeroArchetype;
}

export interface HeroCardIdentity extends HeroCard {
  type: CardType.HERO_IDENTITY;
}

export interface HeroCardAsset extends HeroCard {
  type: CardType.HERO_ASSET;
}

export interface HeroCardEvent extends HeroCard {
  type: CardType.HERO_EVENT;
  manaCost: number;
}

// Dungeon Card Types
export interface DungeonCard extends BaseCard {
  side: CardSide.DUNGEON;
  type: CardType.DUNGEON_FORM | CardType.DUNGEON_VARIANT | CardType.DUNGEON_ROOM;
  dungeonArchetype: DungeonArchetype;
}

export interface DungeonCardForm extends DungeonCard {
  type: CardType.DUNGEON_FORM;
}

export interface DungeonCardVariant extends DungeonCard {
  type: CardType.DUNGEON_VARIANT;
}

export interface DungeonCardRoom extends DungeonCard {
  type: CardType.DUNGEON_ROOM;
  exits: ExitType[];
}

// Neutral Card Types
export interface NeutralCard extends BaseCard {
  side: CardSide.NEUTRAL;
  type: CardType.NEUTRAL_INFO;
}

// Card Type Guards
export const isHeroCard = (card: BaseCard): card is HeroCard => {
  return card.side === CardSide.HERO;
};

export const isDungeonCard = (card: BaseCard): card is DungeonCard => {
  return card.side === CardSide.DUNGEON;
};

export const isNeutralCard = (card: BaseCard): card is NeutralCard => {
  return card.side === CardSide.NEUTRAL;
};

export const isHeroCardEvent = (card: BaseCard): card is HeroCardEvent => {
  return isHeroCard(card) && card.type === CardType.HERO_EVENT;
};

export const isDungeonCardRoom = (card: BaseCard): card is DungeonCardRoom => {
  return isDungeonCard(card) && card.type === CardType.DUNGEON_ROOM;
};

// Helper functions to convert between DB model and type-safe representations
export const parseSubtypes = (subtypesString: string): string[] => {
  return subtypesString ? subtypesString.split(',').map(s => s.trim()) : [];
};

export const stringifySubtypes = (subtypes: string[]): string => {
  return subtypes.join(',');
};

export const parseExits = (exitsString: string | null): ExitType[] => {
  return exitsString ? exitsString.split(',').map(e => e.trim() as ExitType) : [];
};

export const stringifyExits = (exits: ExitType[]): string => {
  return exits.join(',');
};
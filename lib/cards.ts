import prisma from "./prisma";
import {
  BaseCard,
  CardSide,
  CardType,
  DungeonCard,
  DungeonCardRoom,
  HeroCard,
  HeroCardEvent,
  NeutralCard,
  parseExits,
  parseSubtypes,
  stringifyExits,
  stringifySubtypes
} from "../types/card";

// Convert the Prisma Card model to our typed BaseCard and its subtypes
export const formatCard = (dbCard: any): BaseCard => {
  const baseCard: BaseCard = {
    id: dbCard.id,
    name: dbCard.name,
    description: dbCard.description,
    imageUrl: dbCard.imageUrl || undefined,
    side: dbCard.side as CardSide,
    type: dbCard.type as CardType,
    subtypes: parseSubtypes(dbCard.subtypes),
    createdAt: dbCard.createdAt,
    updatedAt: dbCard.updatedAt
  };

  // We can use the base card to determine what type of card it is
  if (baseCard.side === CardSide.HERO) {
    const heroCard = baseCard as HeroCard;
    heroCard.heroArchetype = dbCard.heroArchetype;
    
    if (baseCard.type === CardType.HERO_EVENT) {
      const eventCard = heroCard as HeroCardEvent;
      eventCard.manaCost = dbCard.manaCost;
      return eventCard;
    }
    
    return heroCard;
  } 
  else if (baseCard.side === CardSide.DUNGEON) {
    const dungeonCard = baseCard as DungeonCard;
    dungeonCard.dungeonArchetype = dbCard.dungeonArchetype;
    
    if (baseCard.type === CardType.DUNGEON_ROOM) {
      const roomCard = dungeonCard as DungeonCardRoom;
      roomCard.exits = parseExits(dbCard.exits);
      return roomCard;
    }
    
    return dungeonCard;
  } 
  else {
    return baseCard as NeutralCard;
  }
};

// Format a card for database persistence
export const prepareCardForDB = (card: BaseCard) => {
  return {
    name: card.name,
    description: card.description,
    imageUrl: card.imageUrl,
    side: card.side,
    type: card.type,
    subtypes: stringifySubtypes(card.subtypes),
    
    // Hero card specific fields
    heroArchetype: card.side === CardSide.HERO ? (card as HeroCard).heroArchetype : null,
    manaCost: card.type === CardType.HERO_EVENT ? (card as HeroCardEvent).manaCost : null,
    
    // Dungeon card specific fields
    dungeonArchetype: card.side === CardSide.DUNGEON ? (card as DungeonCard).dungeonArchetype : null,
    exits: card.type === CardType.DUNGEON_ROOM ? stringifyExits((card as DungeonCardRoom).exits) : null,
  };
};

// Search options interface
export interface CardSearchOptions {
  side?: string;
  type?: string;
  search?: string;
}

// CRUD Operations
export async function getAllCards(options: CardSearchOptions = {}): Promise<BaseCard[]> {
  // Build filter based on search options
  const filter: any = {};
  
  // Add side and type filters if provided
  if (options.side) filter.side = options.side;
  if (options.type) filter.type = options.type;
  
  // Add search term if provided (searches in name and description)
  if (options.search) {
    filter.OR = [
      { name: { contains: options.search } },
      { description: { contains: options.search } }
    ];
  }
  
  const cards = await prisma.card.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
  });
  
  return cards.map(formatCard);
}

export async function getCardById(id: number): Promise<BaseCard | null> {
  const card = await prisma.card.findUnique({
    where: { id },
  });
  return card ? formatCard(card) : null;
}

export async function createCard(cardData: Omit<BaseCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<BaseCard> {
  const data = prepareCardForDB(cardData as BaseCard);
  const createdCard = await prisma.card.create({ data });
  return formatCard(createdCard);
}

export async function updateCard(id: number, cardData: Partial<BaseCard>): Promise<BaseCard> {
  // Fetch the existing card first to merge with new data
  const existingCard = await getCardById(id) as BaseCard;
  
  if (!existingCard) {
    throw new Error(`Card with ID ${id} not found`);
  }
  
  // Remove references property if it exists
  const { references, ...cardDataWithoutRefs } = cardData as any;
  
  // Prepare the card data for the database
  const data = prepareCardForDB({
    ...existingCard,
    ...cardDataWithoutRefs
  });
  
  const updatedCard = await prisma.card.update({
    where: { id: id },
    data
  });
  
  return formatCard(updatedCard);
}

export async function deleteCard(id: number): Promise<void> {
  await prisma.card.delete({
    where: { id },
  });
}
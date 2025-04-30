import { PrismaClient } from "@prisma/client";
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

const prisma = new PrismaClient();

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

// CRUD Operations
export async function getAllCards(): Promise<BaseCard[]> {
  const cards = await prisma.card.findMany({
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
  const data = prepareCardForDB({
    ...await getCardById(id) as BaseCard,
    ...cardData
  });
  
  const updatedCard = await prisma.card.update({
    where: { id },
    data
  });
  
  return formatCard(updatedCard);
}

export async function deleteCard(id: number): Promise<void> {
  await prisma.card.delete({
    where: { id },
  });
}
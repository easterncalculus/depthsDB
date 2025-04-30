# DepthsDB - Card Game Database

A web-based database application for managing card game cards.

## Tech Stack

- **Frontend**: React with Next.js
- **Backend**: Node.js (Next.js API routes)
- **Database**: SQLite
- **ORM**: Prisma

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/depthsDB.git
cd depthsDB
```

2. Install dependencies
```bash
npm install
```

3. Initialize Prisma
```bash
npx prisma generate
```

4. Create database and run migrations
```bash
npx prisma migrate dev --name init
```

5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Features

- View all cards in the database
- Add new cards
- Edit existing cards
- Delete cards
- Filter and search cards (coming soon)

## Database Schema

The database includes a `Card` model with the following fields:

- `id`: Unique identifier
- `name`: Card name
- `description`: Card description/effect
- `imageUrl`: Optional URL to card image
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Development

### Prisma Studio

You can use Prisma Studio to view and edit the database directly:

```bash
npm run prisma:studio
```

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## License

MIT

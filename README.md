# Switch With Me

A community-powered seat swap platform for W+ sports fans. Trade single seats, a few games, or your whole season with fans who actually care about the culture. Browse open tickets, try new sections, or let someone awesome take that extra seat off your hands.

## Overview

Switch With Me is a modern web application designed to facilitate ticket swaps between season ticket holders and sports fans. Built with a focus on community, safety, and ease of use, the platform helps fans find better seats through direct peer-to-peer exchanges.

The platform was created specifically for Golden State Valkyries fans and the broader women's and gender-expansive sports community, addressing the challenge of season ticket holders getting scattered during renewals and wanting to sit together.

## Features

### Core Functionality
- **Listing Management**: Create and manage ticket swap listings with detailed seat information
- **Smart Matching**: Browse listings and get matched with compatible swap partners based on preferences
- **Real-time Messaging**: Direct messaging system with WebSocket support for instant communication
- **User Profiles**: Profile system with verification badges and swap history
- **Notification System**: In-app and email notifications for matches and messages
- **Team Support**: Multi-team support with team branding and colors

### User Experience
- **Google OAuth Authentication**: Secure, password-free sign-in
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Real-time Updates**: Socket.IO powered real-time features for messaging and notifications
- **Archive Conversations**: Keep your inbox clean by archiving completed swaps
- **Listing Status Management**: Mark listings as active, inactive, matched, or expired

### Safety & Trust
- **Profile Verification**: Email, phone, and season ticket holder verification badges
- **Swap Counter**: Track successful swap history
- **Transparent Conversations**: All communication kept within the platform
- **User Controls**: End conversations and archive chats as needed

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS with custom theme
- **UI Components**: Radix UI primitives
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React

### Backend
- **Framework**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Real-time**: Socket.IO server
- **Password Hashing**: bcryptjs (for legacy support)

### Infrastructure
- **Node.js**: Version 22.x
- **Custom Server**: Node.js HTTP server with Socket.IO integration
- **Environment Management**: env-cmd for multi-environment support

## Prerequisites

Before setting up the project, ensure you have:

- Node.js 22.x or higher
- PostgreSQL database
- Google OAuth credentials ([Get them here](https://console.cloud.google.com/apis/credentials))
- (Optional) Facebook OAuth credentials ([Get them here](https://developers.facebook.com/apps/))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kidney-swap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file:
   ```bash
   cp .env.example .env.development
   ```

   Edit `.env.development` and configure the following variables:

   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/valkyries_seat_swap"

   # NextAuth - Generate a secret with: openssl rand -base64 32
   NEXTAUTH_SECRET="your-generated-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Facebook OAuth (optional)
   FACEBOOK_CLIENT_ID="your-facebook-app-id"
   FACEBOOK_CLIENT_SECRET="your-facebook-app-secret"

   # Feature Flags
   NEXT_PUBLIC_FEATURE_SEAT_MAP_ENABLED="true"
   ```

4. **Set up the database**

   Create the database:
   ```bash
   createdb valkyries_seat_swap
   ```

   Push the schema to the database:
   ```bash
   npm run db:push
   ```

   Or use migrations (recommended for production):
   ```bash
   npm run db:migrate
   ```

   Seed the database with initial data (teams, etc.):
   ```bash
   npm run db:seed
   ```

## Running the Application

### Development Mode
```bash
npm run start:dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
# Build the application
npm run build:prod

# Start the production server
npm run start:prod
```

### Other Commands
```bash
# Linting
npm run lint

# Generate Prisma Client (runs automatically after npm install)
npm run postinstall

# Database migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push
```

## Project Structure

```
kidney-swap/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding script
├── public/
│   └── images/              # Static images
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   ├── listings/   # Listing CRUD operations
│   │   │   ├── messages/   # Messaging endpoints
│   │   │   ├── matches/    # Matching algorithm
│   │   │   └── notifications/ # Notification system
│   │   ├── listings/       # Listing pages
│   │   ├── messages/       # Messaging interface
│   │   ├── profile/        # User profile pages
│   │   ├── settings/       # User settings
│   │   ├── about/          # About page
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── ...            # Feature components
│   ├── contexts/          # React contexts
│   │   └── SocketContext.tsx # Socket.IO context
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── auth.ts        # NextAuth configuration
│   │   ├── db.ts          # Database utilities
│   │   ├── matching.ts    # Matching algorithm
│   │   ├── notifications.ts # Notification utilities
│   │   └── socket.ts      # Socket.IO utilities
│   └── types/             # TypeScript type definitions
├── server.js              # Custom Node.js server with Socket.IO
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

## Key Features Implementation

### Authentication Flow
- OAuth-only authentication using NextAuth.js
- Google sign-in integration
- Automatic user and profile creation on first login
- Session management with JWT

### Listing System
Users can:
- Create listings specifying what seats they have and want
- Filter listings by team, date, section, and zone
- Toggle listing status (active/inactive)
- View suggested matches based on compatibility

### Matching Algorithm
The platform includes a smart matching system (`src/lib/matching.ts`) that:
- Finds compatible swaps based on wants/haves
- Scores matches based on compatibility
- Suggests potential swap partners
- Considers zone preferences and section preferences

### Real-time Messaging
- Socket.IO integration for real-time communication
- Typing indicators
- Message notifications
- Conversation archiving
- Ability to end conversations with reasons

### Notification System
- In-app notification bell with unread counts
- Email notifications (configurable per user)
- Notification types: matches, new messages
- Mark as read functionality

## Database Schema

The application uses PostgreSQL with the following main models:

- **User**: User accounts and authentication
- **Profile**: User profiles with verification status
- **Team**: Sports teams with branding
- **Listing**: Ticket swap listings
- **Conversation**: Message conversations between users
- **Message**: Individual messages
- **Notification**: User notifications
- **Account/Session**: NextAuth OAuth and session data

See `prisma/schema.prisma` for the complete schema definition.

## Environment-Specific Builds

The project supports multiple environment configurations:

- **Development**: `npm run build:dev` / `npm run start:dev`
- **Production**: `npm run build:prod` / `npm run start:prod`

Environment files:
- `.env.development` - Development environment
- `.env.production` - Production environment

## Contributing

This is currently a one-person project. For feedback, questions, or collaboration inquiries, contact:

**Van** - bonsaitrees@gmail.com

## Support the Project

Switch With Me is built and maintained by one person. If the platform helps you find better seats, consider supporting with a small donation:

[Support on Ko-fi](https://ko-fi.com/van889926)

For sponsorship or partnership opportunities, email bonsaitrees@gmail.com

## License

This project is private and proprietary.

## Acknowledgments

Built with care for the Golden State Valkyries community and all women's and gender-expansive sports fans who want to sit together.

---

*Because we're better when we sit together.*

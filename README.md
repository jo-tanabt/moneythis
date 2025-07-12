# ExpenseThis 💰

A mobile-friendly web application for automatic expense tracking through Gmail integration, natural language processing, and manual logging. Built with React, Node.js, and MongoDB.

## Features ✨

- **Gmail Integration**: Automatically parse receipts from your Gmail
- **Smart Parsing**: Regex-first approach with LLM fallback for maximum accuracy and cost efficiency
- **Natural Language Input**: "Spent $12.50 on coffee at Starbucks" → automatic expense entry
- **Telegram Notifications**: Get notified when expenses are logged
- **Notion-Inspired UI**: Clean, minimalist design focused on readability
- **Analytics Dashboard**: Category breakdowns, period comparisons, and automation insights
- **Mobile-First**: Responsive design optimized for mobile devices

## Architecture 🏗️

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, Vite, React Query
- **Backend**: Node.js, Express, MongoDB, Passport.js
- **APIs**: Gmail API, Telegram Bot API, OpenAI API
- **Authentication**: Google OAuth 2.0 with JWT

### Key Features
- Regex-first email parsing with automatic pattern learning
- LLM fallback for unknown email formats
- Real-time notifications via Telegram
- Comprehensive analytics and insights
- PWA-ready for mobile installation

## Setup Instructions 🚀

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Google Cloud Project with Gmail API enabled
- Telegram Bot (optional)
- OpenAI API key

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd expensethis
npm run install-all
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API in API Library
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
5. Copy Client ID and Client Secret

### 3. Set Up Telegram Bot (Optional)

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Create a new bot with `/newbot`
3. Copy the bot token
4. Users can get their chat ID by messaging your bot and sending `/start`

### 4. Environment Configuration

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/expensethis

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Telegram
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 5. Initialize Database

```bash
cd backend
npm run init-data
```

This creates default categories and email patterns.

### 6. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server  # Backend on :5000
npm run client  # Frontend on :3000
```

## Usage Guide 📱

### Getting Started

1. **Sign in with Google**: Click "Continue with Google" to authenticate and grant Gmail access
2. **Set up Telegram** (optional): 
   - Message your bot and send `/start`
   - Copy your chat ID to Settings
3. **Start tracking expenses**:
   - Manual entry via forms
   - Natural language: "Lunch at McDonald's $8.50"
   - Automatic Gmail parsing

### Dashboard Features

- **Category Breakdown**: Pie chart showing spending by category
- **Period Comparisons**: Week-over-week and month-over-month analysis
- **Automation Analytics**: See how much time you're saving with auto-parsing

### Email Parsing

The system uses a two-tier approach:
1. **Regex patterns** (fast, accurate, cheap) - tries first
2. **LLM parsing** (fallback) - for unknown formats
3. **Pattern learning** - automatically creates regex patterns from successful LLM parses

## API Endpoints 🔌

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Expenses
- `GET /api/expenses` - List expenses (with filters)
- `POST /api/expenses` - Create expense
- `POST /api/expenses/parse-text` - Parse natural language
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Dashboard
- `GET /api/dashboard/categories` - Category breakdown
- `GET /api/dashboard/comparison` - Period comparisons
- `GET /api/dashboard/parsing-analytics` - Automation insights
- `GET /api/dashboard/summary` - Overview stats

### Email
- `POST /api/email/parse` - Parse email content
- `POST /api/email/sync` - Sync recent Gmail emails
- `GET /api/email/patterns` - Get parsing patterns

## Development Scripts 📝

```bash
# Root level
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run install-all  # Install all dependencies

# Backend
npm run dev          # Start with nodemon
npm run init-data    # Initialize default data
npm test            # Run tests

# Frontend  
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
```

## Project Structure 📁

```
expensethis/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, validation
│   ├── utils/          # Helpers
│   └── scripts/        # Data initialization
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Route pages
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API calls
│   │   └── utils/      # Helpers
│   └── public/
└── package.json        # Root package file
```

## Deployment 🚀

### Recommended Free Hosting

- **Frontend**: Vercel (free tier)
- **Backend**: Railway (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Total Cost**: $0-15/month depending on usage

### Environment Variables for Production

Update redirect URIs in Google Cloud Console:
```
https://yourdomain.com/auth/google/callback
```

Set production environment variables:
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MONGODB_URI=mongodb+srv://...your-atlas-connection
```

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security 🔒

- All credentials are stored in environment variables
- JWT tokens for session management
- Rate limiting on API endpoints
- Input validation and sanitization
- HTTPS enforcement in production

## License 📄

MIT License - see LICENSE file for details

---

Built with ❤️ using React, Node.js, and modern web technologies.
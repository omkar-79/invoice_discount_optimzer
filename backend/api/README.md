# Invoice Discount Optimizer API

A Node.js/Express.js backend API for optimizing invoice discount decisions using PostgreSQL and Prisma ORM.

## 🚀 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport.js
- **File Upload**: Multer
- **Logging**: Pino
- **Validation**: express-validator
- **Testing**: Jest + Supertest

## 📋 Features

- **User Authentication**: JWT-based auth with registration/login
- **Invoice Management**: CSV import, financial calculations, recommendations
- **Rate Integration**: Real-time FRED API integration for benchmark rates
- **Decision Tracking**: Audit trail for all financial decisions
- **Analytics**: Dashboard statistics and savings tracking
- **File Upload**: CSV import with validation and parsing
- **Error Handling**: Comprehensive PostgreSQL/Prisma error handling

## 🛠 Project Setup

### Prerequisites

- Node.js 20+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and other settings

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/invoice_optimizer"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=8080
NODE_ENV="development"

# FRED API (optional)
FRED_API_KEY="your-fred-api-key"
```

## 🚀 Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

## 📁 Project Structure

```
src/
├── app.ts                    # Express app setup
├── server.ts                 # Server entry point
├── config/                   # Configuration
│   └── index.ts
├── middleware/               # Custom middleware
│   ├── auth.middleware.ts    # JWT verification
│   ├── error.middleware.ts   # Error handling
│   └── logger.middleware.ts  # Pino logging
├── routes/                   # Route handlers
│   ├── auth.routes.ts
│   ├── invoices.routes.ts
│   ├── rates.routes.ts
│   ├── decisions.routes.ts
│   ├── chat.routes.ts
│   ├── settings.routes.ts
│   └── analytics.routes.ts
├── services/                 # Business logic
│   ├── auth.service.ts
│   ├── invoices.service.ts
│   ├── rates.service.ts
│   ├── decisions.service.ts
│   ├── chat.service.ts
│   ├── settings.service.ts
│   └── analytics.service.ts
├── utils/                    # Utilities
│   ├── calculator.ts
│   ├── csv.parser.ts
│   ├── terms.parser.ts
│   └── fred.client.ts
└── prisma.client.ts          # Prisma singleton
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Invoices
- `GET /api/invoices` - List invoices with filtering
- `POST /api/invoices/import` - Import CSV file
- `POST /api/invoices/update-recommendations` - Update recommendations
- `PATCH /api/invoices/:id/rate` - Update invoice rate

### Rates
- `GET /api/rates/today` - Get current benchmark rates

### Decisions
- `POST /api/decisions` - Create decision batch
- `GET /api/decisions/audit` - Get audit trail

### Analytics
- `GET /api/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/analytics/savings-tracker` - Savings tracking
- `GET /api/analytics/cash-plan` - Cash flow planning

### Settings
- `GET /settings` - Get user settings
- `PUT /settings` - Update settings
- `PUT /settings/profile` - Update profile
- `POST /settings/change-password` - Change password

### Health
- `GET /health` - Health check endpoint

## 🗄 Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts with authentication
- **Invoice**: Invoice data with financial calculations
- **Decision**: Audit trail for user decisions
- **UserSettings**: User preferences and configuration

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t invoice-optimizer-api .

# Run with Docker Compose
docker-compose up -d
```

## 📊 Error Handling

The API includes comprehensive error handling for:

- **Prisma Errors**: Database operation failures
- **JWT Errors**: Authentication failures
- **Validation Errors**: Input validation failures
- **File Upload Errors**: CSV parsing and upload issues
- **Network Errors**: External API failures

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- SQL injection protection via Prisma
- File upload security with size limits

## 📈 Performance

- Connection pooling with Prisma
- Efficient database queries
- File upload streaming
- Response compression
- Structured logging with Pino

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs for debugging

---

Built with ❤️ using Node.js, Express.js, PostgreSQL, and Prisma.
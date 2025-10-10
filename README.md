# Invoice Discount Optimizer

A comprehensive SaaS web application that helps businesses optimize their cash flow by making intelligent decisions about invoice payments. The system analyzes whether to pay invoices early to capture discounts, hold cash for better investment returns, or borrow money to pay early when beneficial.

## 🚀 Key Features

### 💰 Smart Financial Analysis
- **Three-Scenario Analysis**: Pay Early, Hold Cash, or Borrow to Pay Early
- **User-Defined Rates**: Input your own investment or borrowing rates
- **Real-Time Calculations**: Dynamic recommendations based on current data
- **Net Benefit Analysis**: Shows exact dollar amounts for each scenario

### 📊 Advanced Analytics
- **Savings Tracker**: Monthly savings visualization with potential vs. actual
- **Cash Plan**: Weekly cash flow planning with scenario breakdowns
- **Dashboard Stats**: Real-time financial impact metrics
- **Audit Trail**: Complete decision history with detailed reasoning

### 🔐 Enterprise-Ready
- **JWT Authentication**: Secure user sessions with role-based access
- **User Isolation**: Complete data separation between users
- **Settings Management**: Customizable default rates and preferences
- **Manual Entry**: Direct invoice input in addition to CSV uploads

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query) + Context API
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Authentication**: JWT-based with secure token management

### Backend
- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful endpoints with comprehensive error handling
- **Validation**: Class-validator with DTOs
- **Migration**: Prisma migrations for schema management

### Infrastructure
- **Containerization**: Docker with multi-stage builds
- **Cloud**: AWS ECS Fargate + RDS PostgreSQL
- **CI/CD**: GitHub Actions with automated deployment
- **Monitoring**: Health checks and logging
- **Security**: Environment variables with AWS Secrets Manager

## 📁 Project Structure

```
invoice_discount_optimzer/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── (auth)/         # Authentication pages
│   │   │   ├── app/           # Protected application pages
│   │   │   └── demo/          # Demo mode
│   │   ├── components/         # Reusable React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── manual-invoice-form.tsx
│   │   │   └── protected-route.tsx
│   │   ├── contexts/          # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   └── use-api.ts     # API integration with React Query
│   │   └── lib/               # Utilities and constants
│   │       ├── constants.ts   # App constants and enums
│   │       ├── types.ts       # TypeScript definitions
│   │       └── utils.ts       # Utility functions
│   ├── package.json
│   └── next.config.js
├── backend/                    # NestJS backend application
│   └── api/
│       ├── src/
│       │   ├── auth/          # Authentication module
│       │   ├── invoices/      # Invoice management
│       │   │   ├── calculator.ts      # Financial calculations
│       │   │   ├── csv.parser.ts     # CSV parsing
│       │   │   ├── terms.parser.ts    # Terms parsing
│       │   │   ├── invoices.controller.ts
│       │   │   └── invoices.service.ts
│       │   ├── analytics/     # Analytics and reporting
│       │   ├── settings/      # User settings management
│       │   ├── rates/         # Interest rate management
│       │   ├── decisions/     # Decision tracking
│       │   └── prisma/        # Database schema and migrations
│       ├── Dockerfile
│       └── package.json
├── .github/                    # GitHub Actions workflows
│   └── workflows/
│       └── deploy-api.yml     # CI/CD pipeline
├── docker-compose.yml         # Local development setup
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for containerized development)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invoice_discount_optimzer
   ```

2. **Backend Setup**
   ```bash
   cd backend/api
   npm install
   cp .env.example .env
   # Configure DATABASE_URL in .env
   npx prisma migrate dev
   npx prisma generate
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Configure NEXT_PUBLIC_API_BASE_URL in .env.local
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:8080
   - Database Studio: http://localhost:5555 (if using Prisma Studio)

### Docker Development
```bash
docker-compose up -d
```

## 💡 Core Features

### Financial Decision Engine

The application uses sophisticated financial calculations to provide three-scenario analysis:

#### 1. **Pay Early (TAKE)**
- Uses your own cash to capture discount
- Calculates exact savings amount
- Compares against investment opportunity cost

#### 2. **Hold Cash (HOLD)**
- Invests cash elsewhere for better returns
- Calculates potential investment earnings
- Shows opportunity cost of taking discount

#### 3. **Borrow to Pay Early (BORROW)**
- Borrows money to capture discount
- Calculates borrowing cost vs. discount savings
- Shows net benefit of borrowing strategy

### User Rate Configuration

Users can input their own rates for more accurate recommendations:

- **Investment Rate**: Annual return on alternative investments
- **Borrowing Rate**: Cost of borrowing money
- **Default Settings**: Set preferred rates for new invoices
- **Per-Invoice Override**: Custom rates for specific invoices

### Analytics Dashboard

#### Savings Tracker
- **Historical Data**: Past 6 months of actual savings
- **Potential Savings**: Current recommendations impact
- **Monthly Trends**: Visual savings progression
- **ROI Analysis**: Return on investment calculations

#### Cash Plan
- **Weekly Cash Flow**: 4-week rolling cash plan
- **Scenario Breakdown**: Take vs. Hold cash flow
- **Current Week**: Includes pending recommendations
- **Trend Analysis**: Cash flow patterns over time

## 🔧 API Documentation

### Authentication Endpoints
```typescript
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
```

### Invoice Management
```typescript
GET /api/invoices?status=PENDING&limit=10
POST /api/invoices/import
PATCH /api/invoices/:id/rate
POST /api/invoices/update-recommendations
```

### Analytics
```typescript
GET /api/analytics/savings-tracker
GET /api/analytics/cash-plan
GET /api/analytics/dashboard-stats
```

### Settings
```typescript
GET /api/settings
PUT /api/settings
GET /api/settings/default-rates
```

## 🗄️ Database Schema

### Core Models

#### User
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  company      String?
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  invoices     Invoice[]
  decisions    Decision[]
  settings     UserSettings?
}
```

#### Invoice
```prisma
model Invoice {
  id               String   @id @default(cuid())
  userId           String
  vendor           String
  invoiceNumber    String
  amount           Decimal  @db.Decimal(14,2)
  currency         String   @default("USD")
  invoiceDate      DateTime
  dueDate          DateTime
  terms            String
  discountDeadline DateTime?
  impliedAprPct    Float
  recommendation   Recommendation
  reason           String
  status           InvoiceStatus @default(PENDING)
  userRate         Float?   // User's investment or borrowing rate
  rateType         RateType? // 'INVESTMENT' or 'BORROWING'
  borrowingCost    Float?   // Calculated borrowing cost
  investmentReturn Float?   // Calculated investment return
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### UserSettings
```prisma
model UserSettings {
  id                    String   @id @default(cuid())
  userId                String   @unique
  safetyBuffer          Int      @default(200)
  defaultCurrency       String   @default("USD")
  defaultInvestmentRate     Float?
  defaultBorrowingRate     Float?
  defaultRateType          RateType? @default(INVESTMENT)
  emailSummary            Boolean @default(true)
  urgentDeadlineAlerts    Boolean @default(true)
  rateChangeAlerts        Boolean @default(true)
  twoFactorEnabled        Boolean @default(false)
  sessionTimeout          Int      @default(30)
  organizationName        String?
  organizationDomain      String?
  organizationSize        String?
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
}
```

## 🚀 Deployment

### AWS Deployment

The application is designed for deployment on AWS with the following architecture:

#### Backend (ECS Fargate)
- **Container**: Docker image stored in ECR
- **Compute**: ECS Fargate for serverless containers
- **Database**: RDS PostgreSQL with Aurora
- **Load Balancer**: Application Load Balancer
- **Secrets**: AWS Secrets Manager for sensitive data

#### Frontend (Vercel/Amplify)
- **Hosting**: Vercel or AWS Amplify
- **CDN**: Global content delivery
- **SSL**: Automatic HTTPS certificates
- **Environment**: Production environment variables

#### CI/CD Pipeline
- **GitHub Actions**: Automated build and deployment
- **Docker Build**: Multi-stage optimized builds
- **ECR Push**: Automatic image updates
- **ECS Update**: Rolling deployments

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret
FRED_API_KEY=your-fred-api-key
FRED_SERIES_CODE=DGS3MO
NODE_ENV=production
PORT=8080
CORS_ORIGINS=https://your-frontend-domain.com
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
```

## 📊 Financial Calculations

### Discount Analysis
```typescript
// Implied APR calculation
APR = (discount% / (1 - discount%)) × (365 / days) × 100

// Example: 2/10 net 30
// APR = (2% / (1 - 2%)) × (365 / 20) × 100 = 37.24%
```

### Recommendation Logic
```typescript
// Investment scenario
if (discountSavings > investmentReturn) {
  return 'TAKE'
} else {
  return 'HOLD'
}

// Borrowing scenario
if (netBenefit > 0) {
  return 'BORROW'
} else {
  return 'HOLD'
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **User Isolation**: Complete data separation
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Configured cross-origin policies
- **Environment Security**: Sensitive data in environment variables

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **React Query**: Efficient data fetching and caching
- **Docker Multi-stage**: Optimized container builds
- **Prisma Connection Pooling**: Efficient database connections
- **Frontend Code Splitting**: Lazy loading of components

## 🧪 Testing

### Backend Testing
```bash
cd backend/api
npm run test
npm run test:e2e
```

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:e2e
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced reporting and exports
- [ ] Multi-currency support
- [ ] API rate limiting
- [ ] Advanced user permissions
- [ ] Mobile application
- [ ] Integration with accounting software

---

**Built with ❤️ using Next.js, NestJS, TypeScript, and PostgreSQL**
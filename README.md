# Invoice Discount Optimizer

> **A financial analysis platform for optimizing invoice payment decisions using three-scenario analysis with user-defined investment and borrowing rates.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Financial Logic](#financial-logic)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Invoice Discount Optimizer is a sophisticated financial analysis platform that helps businesses make data-driven decisions about invoice payments. By analyzing three scenarios (Pay Early, Hold Cash, Borrow to Pay Early) with user-defined investment and borrowing rates, the platform provides clear recommendations to maximize financial returns.

### Key Capabilities

- **Three-Scenario Analysis**: Compare Pay Early vs Hold Cash vs Borrow to Pay Early
- **Custom Rate Input**: Use your own investment or borrowing rates instead of generic benchmarks
- **CSV Import & Manual Entry**: Bulk import invoices or add them individually
- **Real-time Analytics**: Track savings, cash flow, and decision outcomes
- **User Authentication**: Secure multi-tenant system with JWT authentication
- **Audit Trail**: Complete history of all financial decisions

## 🏗 Architecture

### Current Architecture

The application follows a modern microservices-inspired architecture with clear separation of concerns:

- **Frontend**: Next.js 14 with App Router, deployed on Vercel
- **Backend**: Express.js API server, deployed on AWS ECS Fargate
- **Database**: PostgreSQL with Prisma ORM, hosted on AWS RDS
- **Authentication**: JWT-based with Passport.js middleware
- **File Processing**: Multer for CSV uploads and processing
- **Logging**: Structured logging with Pino
- **Validation**: express-validator for request validation
- **Deployment**: Automated CI/CD with GitHub Actions

### System Architecture

```mermaid
graph TB
    subgraph "Frontend (Next.js)"
        A[Landing Page] --> B[Dashboard]
        B --> C[Invoice Management]
        C --> D[Analytics]
        D --> E[Settings]
    end
    
    subgraph "Backend (Express.js)"
        F[Express Server] --> G[Auth Routes]
        F --> H[Invoice Routes]
        F --> I[Analytics Routes]
        F --> J[Settings Routes]
    end
    
    subgraph "Database (PostgreSQL)"
        K[(User Data)]
        L[(Invoice Data)]
        M[(Decision History)]
        N[(Settings)]
    end
    
    
    subgraph "Infrastructure (AWS)"
        P[ECS Fargate]
        Q[Application Load Balancer]
        R[RDS PostgreSQL]
        S[ECR Container Registry]
    end
    
    A --> Q
    Q --> P
    P --> F
    G --> K
    H --> L
    I --> M
    J --> N
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Express.js Server"
        A[app.ts - Express App Setup]
        B[server.ts - Server Bootstrap]
        C[config/ - Environment Config]
    end
    
    subgraph "Middleware Layer"
        D[Auth Middleware - JWT Verification]
        E[Error Middleware - Global Error Handling]
        F[Logger Middleware - Pino HTTP Logging]
    end
    
    subgraph "Route Layer"
        G[Auth Routes - Login/Register]
        H[Invoice Routes - CRUD Operations]
        I[Analytics Routes - Dashboard Data]
        J[Settings Routes - User Preferences]
        K[Decisions Routes - Audit Trail]
        L[Chat Routes - AI Integration]
        M[Rates Routes - Rate Management]
    end
    
    subgraph "Service Layer"
        N[Auth Service - User Management]
        O[Invoice Service - Business Logic]
        P[Analytics Service - Data Processing]
        Q[Settings Service - Configuration]
    end
    
    subgraph "Data Layer"
        R[Prisma Client - Database ORM]
        S[PostgreSQL - Primary Database]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    A --> K
    A --> L
    A --> M
    
    G --> N
    I --> P
    J --> Q
    
    N --> R
    O --> R
    P --> R
    Q --> R
    
    R --> S
```

### Application Architecture

```mermaid
graph LR
    subgraph "Frontend Layer"
        A[React Components]
        B[React Query]
        C[Auth Context]
        D[UI Components]
    end
    
    subgraph "API Layer"
        E[Express Routes]
        F[Auth Middleware]
        G[Validation & Error Handling]
    end
    
    subgraph "Business Logic"
        H[Services]
        I[Financial Calculator]
        J[CSV Parser]
    end
    
    subgraph "Data Layer"
        K[Prisma ORM]
        L[PostgreSQL]
    end
    
    A --> E
    B --> E
    C --> F
    E --> H
    H --> I
    H --> J
    H --> K
    K --> L
```

## ✨ Features

### Core Features

- **🎯 Smart Financial Analysis**: Three-scenario analysis with user-defined rates
- **📊 Custom Rate Input**: Investment and borrowing rate preferences
- **📁 CSV & Manual Entry**: Flexible invoice input methods
- **📈 Real-Time Analytics**: Live dashboard with savings tracking
- **🔐 User Authentication**: Secure JWT-based authentication
- **📋 Audit Trail**: Complete decision history and tracking

### Advanced Features

- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **📱 Responsive Design**: Works seamlessly on desktop and mobile
- **🌙 Dark Mode**: Theme switching support
- **🤖 AI Chatbot**: Interactive financial guidance
- **📊 Data Visualization**: Charts and graphs for financial insights
- **🔒 Multi-tenant**: User data isolation and security

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Authentication**: JWT with React Context
- **Deployment**: Vercel/AWS Amplify

### Backend
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **File Processing**: Multer for CSV uploads
- **Validation**: express-validator
- **Logging**: Pino with pino-http
- **Deployment**: AWS ECS Fargate

### Infrastructure
- **Container Orchestration**: AWS ECS Fargate
- **Load Balancer**: AWS Application Load Balancer
- **Database**: AWS RDS PostgreSQL
- **Container Registry**: AWS ECR
- **CI/CD**: GitHub Actions
- **Secrets Management**: AWS Secrets Manager

### Key Dependencies

**Backend Dependencies:**
- `express` - Web framework
- `@prisma/client` - Database ORM
- `passport` & `passport-jwt` - Authentication
- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token handling
- `multer` - File upload handling
- `express-validator` - Request validation
- `pino` & `pino-http` - Structured logging
- `fast-csv` - CSV parsing
- `axios` - HTTP client for external services
- `zod` - Schema validation

**Frontend Dependencies:**
- `next` - React framework
- `@radix-ui/*` - UI component primitives
- `tailwindcss` - CSS framework
- `@tanstack/react-query` - Data fetching
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `lucide-react` - Icons

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- AWS CLI (for deployment)
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/invoice_discount_optimizer.git
   cd invoice_discount_optimizer
   ```

2. **Backend Setup**
   ```bash
   cd backend/api
   npm install
   
   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Start development server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Setup environment variables
   cp .env.example .env.local
   # Edit .env.local with your API base URL
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api

## 🔧 Development

### Project Structure

```
invoice_discount_optimizer/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   └── lib/             # Utilities and types
│   └── package.json
├── backend/
│   └── api/                 # Express.js backend API
│       ├── src/
│       │   ├── routes/      # Express route handlers
│       │   ├── services/    # Business logic services
│       │   ├── middleware/  # Custom middleware (auth, error, logging)
│       │   ├── utils/       # Utility functions
│       │   ├── types/       # TypeScript type definitions
│       │   ├── config/      # Configuration management
│       │   ├── app.ts       # Express app setup
│       │   └── server.ts    # Server entry point
│       ├── prisma/          # Database schema and migrations
│       └── package.json
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
└── README.md
```

### Available Scripts

**Backend**
```bash
npm run dev          # Start development server with hot reload (tsx watch)
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
npm run start:dev    # Alternative dev command
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
```

**Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Environment Variables

**Backend (.env)**
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/invoice_optimizer"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=8080
NODE_ENV="development"

# CORS
CORS_ORIGINS="http://localhost:3000,https://your-frontend-domain.com"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8080/api"
```

## 🚀 Deployment

### AWS Deployment

The application is deployed on AWS using ECS Fargate with the following architecture:

1. **GitHub Actions** builds and pushes Docker images to ECR
2. **ECS Fargate** runs the containerized application
3. **Application Load Balancer** handles traffic routing and SSL termination
4. **RDS PostgreSQL** provides managed database services

### Deployment Process

1. **Push to dev branch** triggers automatic deployment
2. **Docker image** is built and pushed to ECR
3. **ECS service** is updated with new task definition
4. **Prisma migrations** are automatically applied
5. **Health checks** ensure successful deployment

### Manual Deployment

```bash
# Build and push Docker image
docker build -t your-ecr-repo:latest ./backend/api
docker push your-ecr-repo:latest

# Update ECS service
aws ecs update-service --cluster your-cluster --service your-service --force-new-deployment
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |

### Invoice Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices with filtering |
| POST | `/api/invoices/import` | Import CSV file |
| PATCH | `/api/invoices/:id/rate` | Update invoice rate |
| POST | `/api/invoices/update-recommendations` | Update recommendations |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard-stats` | Dashboard statistics |
| GET | `/api/analytics/savings-tracker` | Savings tracking |
| GET | `/api/analytics/cash-plan` | Cash flow planning |

### Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/settings` | Get user settings |
| PUT | `/settings` | Update settings |
| PUT | `/settings/profile` | Update profile |
| POST | `/settings/change-password` | Change password |

## 💰 Financial Logic

### Three-Scenario Analysis

The platform analyzes three scenarios for each invoice:

1. **Pay Early (TAKE)**: Use cash to get the discount
2. **Hold Cash (HOLD)**: Keep cash invested and pay at net terms
3. **Borrow to Pay Early (BORROW)**: Borrow money to get the discount

### Calculation Logic

```typescript
// Example calculation
const discountSavings = amount * (discountPct / 100);
const investmentReturn = amount * (annualRate / 365 / 100) * discountDays;
const borrowingCost = amount * (borrowingRate / 365 / 100) * (netDays - discountDays);

// Recommendation logic
if (rateType === 'INVESTMENT') {
  if (discountSavings > investmentReturn) return 'TAKE';
  else return 'HOLD';
} else {
  const netBenefit = discountSavings - borrowingCost;
  if (netBenefit > 0) return 'BORROW';
  else return 'HOLD';
}
```

### Key Metrics

- **Implied APR**: Annual percentage rate of the discount
- **Discount Savings**: Dollar amount saved by paying early
- **Investment Return**: Potential earnings from holding cash
- **Borrowing Cost**: Cost of borrowing to pay early
- **Net Benefit**: Net financial benefit of the recommended action

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch from `dev`
3. **Make** your changes with proper tests
4. **Commit** with conventional commit messages
5. **Push** to your fork
6. **Create** a pull request to `dev` branch

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Prettier**: Consistent code formatting
- **Tests**: Write tests for new functionality
- **Documentation**: Update docs for API changes

### Commit Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the maintainers for urgent issues

### Common Issues

1. **Database Connection**: Ensure PostgreSQL is running and DATABASE_URL is correct
2. **JWT Errors**: Check JWT_SECRET is set and consistent
3. **CORS Issues**: Verify CORS_ORIGINS includes your frontend URL
4. **Import Failures**: Check CSV format and required fields

### Performance Tips

- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Monitor ECS task health and scaling

---

**Built with ❤️ using Next.js, Express.js, PostgreSQL, and AWS**

*For more detailed technical documentation, see the inline code comments and API documentation.*

# Invoice Discount Optimizer

A comprehensive SaaS web application that helps small businesses decide whether to pay invoices early to take discounts or hold cash, using today's short-term interest rates.

## 🚀 Features

### Core Functionality
- **CSV Import Wizard**: Drag-and-drop CSV upload with smart column mapping
- **Ranked Recommendations**: AI-powered analysis of invoice discounts vs. current interest rates
- **Savings Tracker**: Monthly savings visualization with ROI calculations
- **Audit Trail**: Complete history of all decisions with full transparency
- **AI Chatbot**: Instant explanations for any invoice or recommendation

### User Experience
- **Responsive Design**: Mobile-first approach, works on 360px to desktop
- **Dark/Light Mode**: System preference detection with manual toggle
- **Accessibility**: WCAG AA compliant with keyboard navigation
- **Demo Mode**: One-click demo with prefilled data

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query (TanStack Query) + local state
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Themes**: next-themes for dark mode support

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication pages
│   │   ├── app/               # Protected app pages
│   │   ├── demo/              # Demo mode
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   └── chatbot-drawer.tsx # AI assistant
│   ├── hooks/                 # Custom React hooks
│   │   └── use-api.ts         # API integration
│   ├── lib/                   # Utilities and constants
│   │   ├── constants.ts       # App constants
│   │   ├── i18n.ts           # Internationalization
│   │   ├── mock-data.ts      # Mock data for development
│   │   ├── types.ts          # TypeScript definitions
│   │   └── utils.ts          # Utility functions
│   └── styles/
│       └── globals.css        # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invoice_discount_optimzer
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📱 Pages & Features

### Landing Page (`/`)
- Hero section with value proposition
- How it works (3-step process)
- Features showcase
- Security & privacy information
- Call-to-action buttons

### Authentication (`/auth/*`)
- **Sign In**: Email/password + magic link
- **Sign Up**: Company registration
- **Forgot Password**: Password reset flow

### Demo Mode (`/demo`)
- Prefilled sample data
- Interactive invoice selection
- Savings calculations
- Account creation CTA

### Dashboard (`/app/dashboard`)
- Today's benchmark rate display
- Action queue with sortable invoices
- Bulk selection and approval
- Savings tracker with charts
- Cash plan visualization

### CSV Upload (`/app/upload`)
- 4-step wizard process
- Drag-and-drop file upload
- Column mapping interface
- Data validation and preview
- Sample CSV download

### Invoices Library (`/app/invoices`)
- Comprehensive filtering system
- Sortable table with all details
- Invoice detail drawer
- Status tracking and recommendations

### Audit & History (`/app/audit`)
- Complete decision history
- Filtering by date, user, action
- Summary statistics
- Detailed audit entry viewer

### Settings (`/app/settings`)
- Profile management
- Organization settings
- Financial preferences
- Notification settings

### AI Chatbot
- Right-side drawer interface
- Quick prompt buttons
- Invoice explanation tool
- Top discounts recommendation
- Formatted response display

## 🎨 Design System

### Colors
- **Primary**: #2563eb (blue-600)
- **Accent**: #10b981 (emerald-500) for TAKE
- **Warning**: #f59e0b (amber-500)
- **Danger**: #ef4444 (red-500)

### Typography
- **Font**: Inter (weights: 400/500/600)
- **Base Size**: 14-16px
- **Responsive**: Mobile-first approach

### Components
- **Buttons**: Rounded-xl, clear focus rings
- **Cards**: Subtle shadows, 16-24px padding
- **Forms**: Zod validation, React Hook Form
- **Tables**: Sortable, filterable, paginated

## 🔧 Development

### Mock API System
The application includes a complete mock API system for development:
- All API endpoints are mocked with realistic data
- Loading states and error handling
- Type-safe API contracts
- Easy to replace with real backend

### Key Files
- `src/hooks/use-api.ts` - API integration hooks
- `src/lib/mock-data.ts` - Sample data
- `src/lib/types.ts` - TypeScript definitions
- `src/lib/constants.ts` - App constants

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## 📊 Sample Data

The application includes realistic sample data:
- 5 sample invoices with different terms
- Mock interest rate data
- Historical audit entries
- Savings tracking data

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Setup
1. Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL
2. Configure authentication endpoints
3. Set up database for persistent data

## 📝 API Endpoints

### Authentication
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/magic-link` - Magic link authentication

### Data
- `GET /api/rates/today` - Current interest rates
- `GET /api/invoices` - Invoice list with filters
- `POST /api/invoices/import` - CSV import
- `POST /api/decisions` - Approve/dismiss invoices
- `GET /api/decisions/audit` - Audit history

### AI Chat
- `POST /api/chat/explain-invoice` - Invoice explanation
- `POST /api/chat/pick-top-discounts` - Top recommendations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
# Owner Portal Frontend

A modern React TypeScript application for property management with SmartHoster-inspired design.

## 🚀 Features

- **Modern UI/UX**: SmartHoster-inspired design with Tailwind CSS
- **Authentication**: Complete auth flow with JWT tokens
- **Dashboard**: Comprehensive owner dashboard with performance metrics
- **Bookings Management**: View and manage property bookings
- **Invoice Management**: Track invoices and billing
- **Tourist Tax**: Monitor tourist tax collection and reporting
- **SIBA Compliance**: Guest registration compliance management
- **Responsive Design**: Mobile-first responsive design
- **State Management**: Redux Toolkit for state management
- **Charts & Analytics**: Interactive charts with Chart.js

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Charts**: Chart.js + react-chartjs-2
- **Icons**: Lucide React
- **Utilities**: clsx for conditional classes

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── charts/         # Chart components
│   ├── common/         # Common/shared components
│   ├── dashboard/      # Dashboard specific components
│   └── layout/         # Layout components (Navbar, Sidebar, etc.)
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   └── dashboard/     # Dashboard pages
├── services/           # API service functions
├── store/              # Redux store and slices
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx            # Main app component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd owner-portal/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the frontend root:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_APP_NAME=Owner Portal
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🎨 Design System

The application follows a SmartHoster-inspired design system with:

- **Colors**: Primary blue, success green, warning yellow, danger red
- **Typography**: Clean, modern font hierarchy
- **Components**: Consistent button styles, cards, forms
- **Layout**: Responsive grid system with Tailwind CSS

### Key Components

- **StatCard**: Performance metric cards with trend indicators
- **PropertySelector**: Dropdown for property selection
- **LoadingSpinner**: Consistent loading states
- **Navbar**: Top navigation with user menu and notifications
- **Sidebar**: Left navigation with role-based menu items

## 📊 State Management

Redux Toolkit is used for state management with the following slices:

- **auth**: User authentication and session management
- **properties**: Property data and selection
- **bookings**: Booking data and filters
- **invoices**: Invoice data and summaries
- **touristTax**: Tourist tax analytics
- **siba**: SIBA compliance status
- **notifications**: Application notifications

## 🔌 API Integration

The frontend connects to the backend through organized API services:

- **authAPI**: Authentication endpoints
- **bookingsAPI**: Booking data endpoints
- **invoicesAPI**: Invoice management endpoints
- **touristTaxAPI**: Tourist tax analytics endpoints
- **sibaAPI**: SIBA compliance endpoints

## 🎯 Key Features

### Dashboard
- Performance metrics with trend indicators
- Revenue and occupancy charts
- Recent bookings overview
- SIBA compliance status
- Quick action buttons

### Bookings Management
- Comprehensive booking table with filters
- Property-specific booking views
- Export functionality
- Real-time status updates

### Invoice Management
- Invoice list with status tracking
- Download and export capabilities
- Payment status monitoring
- Financial summaries

### Tourist Tax Analytics
- Tax collection tracking
- Guest and night analysis
- Platform breakdown
- Future-ready for tax implementation

### SIBA Compliance
- Guest registration status
- Submission tracking
- Compliance rate monitoring
- Quick submission actions

## 🔐 Authentication

The app implements JWT-based authentication with:

- Login/Signup flows
- Password reset functionality
- Protected routes
- Role-based access control
- Token refresh handling

## 📱 Responsive Design

The application is fully responsive with:

- Mobile-first approach
- Responsive navigation (collapsible sidebar)
- Optimized touch interactions
- Adaptive layouts for all screen sizes

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Style

- TypeScript strict mode enabled
- ESLint for code quality
- Consistent naming conventions
- Component composition patterns

## 🚀 Deployment

The application can be deployed to any static hosting service:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist/` folder** to your hosting service (Vercel, Netlify, etc.)

3. **Configure environment variables** on your hosting platform

## 📄 License

This project is part of the Owner Portal system for property management.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Ensure all TypeScript types are properly defined
3. Test responsive design on multiple screen sizes
4. Update this README for any new features

## 📞 Support

For support, please contact the development team or create an issue in the repository.




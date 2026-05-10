# Personal Finance Tracker - Frontend

React 18 frontend for the Personal Finance Tracker application. Modern, responsive UI with role-based access control, transaction management, and financial analytics.

## 🛠 Tech Stack

- **React**: 18.2.0
- **Vite**: Frontend build tool
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Data visualization (to be integrated in Phase 5)
- **CSS**: Responsive design

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           # Navigation bar
│   ├── Navbar.css
│   ├── ProtectedRoute.jsx   # Protected route wrapper
│   └── Loading.jsx          # Loading spinner
├── pages/
│   ├── LoginPage.jsx        # Login page
│   ├── RegisterPage.jsx     # Registration page
│   ├── DashboardPage.jsx    # Dashboard with stats
│   ├── TransactionsPage.jsx # Transaction management
│   ├── AnalyticsPage.jsx    # Analytics & charts
│   ├── AuthPages.css        # Auth page styles
│   └── Pages.css            # Page styles
├── context/
│   ├── AuthContext.jsx      # Authentication context
│   └── ThemeContext.jsx     # Theme context
├── services/
│   ├── apiClient.js         # Axios instance with auth
│   ├── transactionService.js
│   ├── analyticsService.js
│   └── categoryService.js
├── hooks/
│   └── useAuth.js           # Custom auth hook
├── utils/
│   └── roleChecks.js        # Role checking utilities
├── App.jsx                  # Main app with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 22 LTS
node --version

# pnpm
npm install -g pnpm
```

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start development server
pnpm run dev
```

Application will be available at `http://localhost:5173`

## 📚 Features

### Authentication
- User registration and login
- JWT-based token storage
- Auto-logout on token expiration
- Protected routes

### Role-Based UI
- Admin: Full access to all features
- User: Manage own transactions and analytics
- Read-Only: View-only access (no edit/delete buttons)

### Pages

#### Login / Register
- Email and password validation
- Demo credentials display
- Link to switch between login/register

#### Dashboard
- Quick stats: Total income, expense, net balance, transaction days
- Real-time data from `/api/analytics/summary`
- Quick navigation to other pages

#### Transactions
- View all personal transactions
- Filter by category, date range
- Pagination (10 per page)
- Edit/Delete buttons (admin & user only)
- Create new transaction form (admin & user only)
- Responsive table layout

#### Analytics
- Monthly spending overview chart
- Category-wise expense breakdown (pie chart)
- Income vs Expense trends (line chart)
- Summary statistics
- Cached data with automatic refresh

## 🎨 Styling

- Modern, clean UI with gradient backgrounds
- Responsive design (mobile-first)
- Color-coded role badges
- Hover effects and transitions
- Global CSS variables for theming

## 🔐 Security Features

- JWT token stored in localStorage
- Auto-attach token to API requests via interceptor
- Auto-logout on 401 response
- Role-based UI rendering
- Input validation on forms

## ⚙️ Configuration

### Environment Variables

```bash
VITE_API_URL=https://transaction-management-jbxn.onrender.com/api
VITE_APP_NAME=Personal Finance Tracker
VITE_APP_VERSION=1.0.0
```

### Axios Configuration

- Base URL: `VITE_API_URL` env variable
- Default header: `Content-Type: application/json`
- Auto-attach: `Authorization: Bearer <token>`
- Auth interceptor: Remove token on 401

## 🪝 Custom Hooks

### `useAuth()`

```javascript
const { user, token, login, register, logout, isAuthenticated, isLoading, error } = useAuth();
```

### `useTheme()`

```javascript
const { isDark, toggleTheme } = useTheme();
```

## 🎨 Styling Classes

### Cards & Containers
- `.card` - White card with shadow
- `.container` - Max-width container
- `.error` - Error message styling
- `.success` - Success message styling
- `.loading` - Loading state styling

### Forms
- `.form-group` - Form field wrapper
- `.btn` - Button base
- `.btn-primary` - Primary button
- `.btn-danger` - Danger button
- `.btn-small` - Small inline button

## 🚢 Building for Production

```bash
# Build optimized bundle
pnpm run build

# Output in dist/
```

## 🐛 Troubleshooting

### API Connection Failed
- Ensure backend server is running on port 5000
- Verify `VITE_API_URL` in `.env` matches backend URL
- Check CORS configuration in backend

### Styles Not Loading
- Clear browser cache
- Restart dev server
- Check CSS file imports

### Login Issues
- Verify backend is running
- Check browser console for errors
- Verify credentials in demo list

## 📝 API Integration

All API calls go through `apiClient` instance which:
1. Sets base URL from `VITE_API_URL`
2. Auto-attaches JWT token from localStorage
3. Handles 401 responses by clearing token and redirecting
4. Provides request/response interceptors

### Making API Calls

```javascript
import apiClient from './services/apiClient';

// In any component
const response = await apiClient.get('/transactions');
```

## 🤝 Contributing

1. Create feature branch
2. Follow existing code style
3. Test on different screen sizes
4. Submit PR with description

## 📄 License

ISC

---

**Last Updated**: May 8, 2026  
**Status**: In Development (Phase 3 Complete)

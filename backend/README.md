# Personal Finance Tracker - Backend

Node.js + Express backend for the Personal Finance Tracker application. Handles authentication, transaction management, analytics, and caching.

## 🛠 Tech Stack

- **Runtime**: Node.js 22 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Caching**: Redis
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Rate Limiting**: express-rate-limit

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js         # PostgreSQL connection pool
│   └── redis.js            # Redis client initialization
├── db/
│   ├── schema.sql          # Database schema with tables
│   └── init.js             # Database initialization script
├── middleware/
│   ├── authMiddleware.js   # JWT verification & role checks
│   ├── rateLimitMiddleware.js  # Rate limiting for endpoints
│   └── cacheMiddleware.js  # Redis caching layer
├── routes/
│   ├── auth.js             # Authentication endpoints
│   ├── transactions.js     # Transaction CRUD endpoints
│   └── analytics.js        # Analytics & reporting endpoints
├── utils/
│   └── (helper functions)
└── index.js                # Main server file
```

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js v22 LTS
node --version

# pnpm package manager
npm install -g pnpm

# PostgreSQL
psql --version

# Redis (optional for local dev, but recommended)
redis-server --version
```

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update .env with your credentials:
# - DATABASE_URL or DB_* variables
# - REDIS_URL
# - JWT_SECRET (use a strong random string in production)
```

### Database Setup

```bash
# Create PostgreSQL database (if not exists)
createdb personal_finance_tracker

# Run migrations
pnpm run migrate

# Verify schema
psql -U postgres -d personal_finance_tracker -c "\dt"
```

### Running the Server

```bash
# Development mode (with auto-reload)
pnpm run dev

# Production mode
pnpm run start
```

Server will start on http://localhost:5000

## 📚 API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 201
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Rate Limit**: 5 requests per 15 minutes

### Transactions (`/api/transactions`)

All transaction endpoints require authentication header:
```
Authorization: Bearer <jwt_token>
```

#### Get All Transactions
```http
GET /api/transactions?page=1&limit=10&category=Food&startDate=2024-01-01&endDate=2024-12-31

Response: 200
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "type": "expense",
      "amount": "50.00",
      "category_id": 1,
      "category": "Food",
      "description": "Lunch",
      "transaction_date": "2024-05-08",
      "created_at": "2024-05-08T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Create Transaction (Admin & User only)
```http
POST /api/transactions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "type": "expense",
  "amount": 50.00,
  "categoryId": 1,
  "description": "Lunch at restaurant",
  "transactionDate": "2024-05-08"
}

Response: 201
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "type": "expense",
    "amount": "50.00",
    "category_id": 1,
    "description": "Lunch",
    "transaction_date": "2024-05-08",
    "created_at": "2024-05-08T10:30:00Z"
  }
}
```

#### Update Transaction (Admin & User only)
```http
PUT /api/transactions/1
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Lunch - Updated"
}

Response: 200
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": { ... }
}
```

#### Delete Transaction (Admin & User only)
```http
DELETE /api/transactions/1
Authorization: Bearer <jwt_token>

Response: 200
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

**Rate Limit**: 100 requests per hour

### Analytics (`/api/analytics`)

All analytics endpoints require authentication and return user-scoped data only.

#### Monthly Overview (Cached 15 min)
```http
GET /api/analytics/monthly
Authorization: Bearer <jwt_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "month": "2024-05-01",
      "income": 5000.00,
      "expense": 1200.00
    }
  ]
}
```

#### Category Breakdown (Cached 1 hour)
```http
GET /api/analytics/category
Authorization: Bearer <jwt_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "name": "Food",
      "value": 450.50,
      "count": 12
    }
  ]
}
```

#### Income vs Expense Trends (Cached 15 min)
```http
GET /api/analytics/income-vs-expense
Authorization: Bearer <jwt_token>

Response: 200
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "income": 5000.00,
      "expense": 1200.00,
      "net": 3800.00
    }
  ]
}
```

#### Summary Stats (Real-time, not cached)
```http
GET /api/analytics/summary
Authorization: Bearer <jwt_token>

Response: 200
{
  "success": true,
  "data": {
    "totalIncome": 15000.00,
    "totalExpense": 3600.00,
    "netBalance": 11400.00,
    "transactionDays": 45
  }
}
```

**Rate Limit**: 50 requests per hour

## 🔐 Role-Based Access Control (RBAC)

Three roles with different permissions:

| Feature | Admin | User | Read-Only |
|---------|-------|------|-----------|
| View Transactions | ✅ All | ✅ Own | ✅ Own |
| Create Transaction | ✅ | ✅ | ❌ |
| Edit Transaction | ✅ All | ✅ Own | ❌ |
| Delete Transaction | ✅ All | ✅ Own | ❌ |
| View Analytics | ✅ All | ✅ Own | ✅ Own |
| Manage Users | ✅ | ❌ | ❌ |

## 🔒 Security Features

### Authentication
- JWT-based stateless authentication
- Token expiration: 24 hours (configurable via `JWT_EXPIRY`)
- Password hashing with bcryptjs (10 salt rounds)

### Authorization
- Role-based middleware enforcement
- User data isolation (users can only access their own data)
- Admin can access all user data

### API Security
- CORS protection with origin whitelist
- Helmet.js for security headers (XSS, CSRF protection)
- SQL injection prevention via parameterized queries
- Input validation on all endpoints
- Rate limiting on sensitive endpoints

### Rate Limiting
- **Auth**: 5 requests per 15 minutes
- **Transactions**: 100 requests per hour
- **Analytics**: 50 requests per hour

## ⚡ Performance Features

### Caching with Redis
- **Monthly analytics**: 15-minute cache
- **Category breakdown**: 1-hour cache
- **Trends**: 15-minute cache
- **Cache invalidation**: Automatic on data write

### Database Optimization
- Indexed columns: user_id, category_id, transaction_date
- Pagination support (default: 10 per page)
- Efficient aggregation queries

### Connection Pooling
- PostgreSQL connection pool: max 20 connections
- Auto-reconnect on connection loss
- Idle timeout: 30 seconds

## 🧪 Development

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/personal_finance_tracker
DB_HOST=localhost
DB_PORT=5432
DB_NAME=personal_finance_tracker
DB_USER=postgres
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRY=24h

# Server
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Useful Commands

```bash
# Start development server with auto-reload
pnpm run dev

# Start production server
pnpm run start

# Initialize/migrate database
pnpm run migrate

# Check database schema
psql -U postgres -d personal_finance_tracker -c "\dt"

# Clear Redis cache (if needed)
redis-cli FLUSHDB
```

## 📊 Database Schema

### Users Table
```sql
id (PRIMARY KEY)
email (UNIQUE)
password (hashed)
role (admin | user | read-only)
created_at
updated_at
```

### Categories Table
```sql
id (PRIMARY KEY)
name (UNIQUE)
created_at
```

### Transactions Table
```sql
id (PRIMARY KEY)
user_id (FOREIGN KEY)
type (income | expense)
amount (decimal)
category_id (FOREIGN KEY)
description (text)
transaction_date (date)
created_at
updated_at
```

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Verify credentials
psql -U postgres -h localhost
```

### Redis Connection Warning
Redis is optional for development. The application will work without it (no caching).

```bash
# Start Redis
redis-server

# Or skip Redis and proceed without caching
```

### Port Already in Use
```bash
# Use different port
PORT=5001 pnpm run dev

# Or kill process on port 5000
lsof -i :5000
kill -9 <PID>
```

## 📝 API Documentation

For complete API documentation with examples, see [API.md](../API.md)

## 🤝 Contributing

1. Create a feature branch
2. Make changes following existing code style
3. Test thoroughly
4. Submit PR with description

## 📄 License

ISC

---

**Last Updated**: May 8, 2026

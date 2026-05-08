# Setup Guide - Personal Finance Tracker

Complete setup instructions for running the Personal Finance Tracker application locally.

## 📋 Prerequisites

- Node.js v22 LTS or higher
- pnpm v8+
- PostgreSQL 12+
- Redis 6+ (optional but recommended)
- Git
- Terminal/CMD access

## 🔧 Installation Steps

### 1. Install System Dependencies

#### macOS (using Homebrew)

```bash
# Install Node.js
brew install node

# Install PostgreSQL
brew install postgresql@15

# Install Redis (optional)
brew install redis

# Verify installations
node --version    # v22.x.x
npm --version
psql --version    # postgresql@15
redis-server --version
```

#### Ubuntu/Debian

```bash
# Update package manager
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install -y redis-server

# Verify installations
node --version
psql --version
redis-server --version
```

#### Windows

- Download and install [Node.js 22 LTS](https://nodejs.org/)
- Download and install [PostgreSQL 15](https://www.postgresql.org/download/windows/)
- Download and install [Redis for Windows](https://github.com/microsoftarchive/redis/releases)

### 2. Install pnpm

```bash
npm install -g pnpm@latest
pnpm --version
```

### 3. Start Database Services

#### PostgreSQL

**macOS:**
```bash
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo systemctl start postgresql
```

**Windows:**
PostgreSQL should start automatically. Verify:
```bash
psql --version
```

#### Redis (Optional but Recommended)

**macOS:**
```bash
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo systemctl start redis-server
```

**Windows:**
Start Redis manually or via Services if installed.

### 4. Create PostgreSQL Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# In PostgreSQL prompt, run:
CREATE USER personal_finance WITH PASSWORD 'password';
ALTER USER personal_finance CREATEDB;
CREATE DATABASE personal_finance_tracker OWNER personal_finance;
\q
```

Or use createdb command:
```bash
createdb -U postgres personal_finance_tracker
```

### 5. Clone/Navigate to Project

```bash
cd /path/to/Intern_Project
```

### 6. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials (if different)
# nano .env  # or use your editor

# Install dependencies
pnpm install

# Initialize database (run migrations)
pnpm run migrate

# Verify database connection
psql -U postgres -d personal_finance_tracker -c "\dt"
# Should show: users, categories, transactions tables
```

### 7. Frontend Setup

```bash
cd ../frontend

# Copy environment file
cp .env.example .env

# Verify .env has correct API URL
# VITE_API_URL=http://localhost:5000/api

# Install dependencies
pnpm install
```

### 8. Seed Demo Data (Optional)

Create demo users in PostgreSQL:

```bash
psql -U postgres -d personal_finance_tracker
```

```sql
-- Insert demo users
INSERT INTO users (email, password, role) VALUES 
  ('admin@demo.com', '$2a$10$O1u4S7t1I6...', 'admin'),
  ('user@demo.com', '$2a$10$O1u4S7t1I6...', 'user'),
  ('readonly@demo.com', '$2a$10$O1u4S7t1I6...', 'read-only');

-- Note: Use actual bcryptjs hashed passwords
-- For testing, just register new users via the app

\q
```

## 🚀 Running the Application

### Development Mode (Two Terminal Windows)

**Terminal 1 - Backend:**
```bash
cd backend
pnpm run dev
```

Expected output:
```
╔════════════════════════════════════════════════════════════╗
║   Personal Finance Tracker Backend                        ║
║   Server started successfully!                            ║
╚════════════════════════════════════════════════════════════╝

🌐 API Server: http://localhost:5000
📝 Health Check: http://localhost:5000/health
🔧 Environment: development

✅ Ready to accept requests
```

**Terminal 2 - Frontend:**
```bash
cd frontend
pnpm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
```

### Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## 📝 Demo Credentials

After setup, you can register new accounts or use the provided demo credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | AdminDemo123 |
| User | user@demo.com | UserDemo123 |
| Read-Only | readonly@demo.com | ReadonlyDemo123 |

**To create these demo users:**

1. Register each user via the signup page, OR
2. Insert manually into the database with hashed passwords

## ✅ Verification Steps

### 1. Verify Backend Setup

```bash
# Health check
curl http://localhost:5000/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-05-08T10:30:00Z",
  "environment": "development"
}
```

### 2. Verify Database Connection

```bash
# Check tables exist
psql -U postgres -d personal_finance_tracker -c "\dt"

# Check categories are loaded
psql -U postgres -d personal_finance_tracker -c "SELECT * FROM categories;"
```

### 3. Verify Redis Connection (Optional)

```bash
# Test Redis
redis-cli ping

# Expected: PONG
```

### 4. Test API Endpoints

```bash
# Register a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected response with token
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "user"
  }
}
```

### 5. Verify Frontend Loads

Visit http://localhost:5173 in your browser. Should see:
- Login page if not authenticated
- Dashboard if logged in

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Backend port 5000 in use
PORT=5001 pnpm run dev

# Frontend port 5173 in use
# Edit vite.config.js and change server.port
```

### Database Connection Failed

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
```bash
# Check PostgreSQL is running
ps aux | grep postgres

# Or start it:
sudo systemctl start postgresql  # Linux
brew services start postgresql@15  # macOS
```

### Database Already Exists

```bash
# Drop and recreate
dropdb personal_finance_tracker
createdb personal_finance_tracker
pnpm run migrate
```

### CORS Errors

Ensure backend `.env` has correct CORS_ORIGIN:
```
CORS_ORIGIN=http://localhost:5173
```

### API Not Responding

- Verify backend is running: `curl http://localhost:5000/health`
- Check firewall settings
- Verify `VITE_API_URL` in frontend `.env`

### Redis Connection Warning

Redis is optional. If you see Redis warnings:
```bash
# Either start Redis
redis-server

# Or ignore - app works without caching
```

### pnpm Command Not Found

```bash
npm install -g pnpm
# Or use npm instead of pnpm:
npm install
npm run dev
```

## 📊 Project Structure After Setup

```
Intern_Project/
├── backend/
│   ├── node_modules/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── node_modules/
│   ├── src/
│   ├── dist/ (after build)
│   ├── .env
│   ├── package.json
│   └── README.md
├── .gitignore
├── README.md
└── SETUP.md
```

## 🔌 Environment Checklist

Before starting, verify all are in place:

- [ ] Node.js 22 LTS installed
- [ ] pnpm installed globally
- [ ] PostgreSQL running
- [ ] PostgreSQL database created
- [ ] Redis running (optional)
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Backend dependencies installed (`pnpm install`)
- [ ] Frontend dependencies installed (`pnpm install`)
- [ ] Database migrations run (`pnpm run migrate`)

## 🚢 Production Deployment

For production deployment, see:
- Backend deployment: `backend/README.md`
- Frontend deployment: `frontend/README.md`

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check error messages in terminal output
4. Verify `.env` files have correct values
5. Check firewall/network settings

## 📝 Next Steps

1. **Test Login**: Register a new user at http://localhost:5173/register
2. **Add Transactions**: Navigate to Transactions page and add income/expense
3. **View Analytics**: Check Analytics page for dashboard and charts
4. **Test Roles**: Login with different demo credentials to test role restrictions

---

**Last Updated**: May 8, 2026  
**Status**: Ready for Phase 3 Testing

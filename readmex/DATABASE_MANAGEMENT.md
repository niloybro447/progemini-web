# Database Management Guide - ProGemini LMS

This guide covers how to audit, manage, and work with your PostgreSQL database locally using Prisma Studio and other tools.

## 🎯 Quick Start - Prisma Studio

### What is Prisma Studio?
Prisma Studio is a visual database editor that comes with Prisma. It allows you to:
- View all database tables and records
- Create, read, update, and delete records
- Filter and search data
- Manage relationships between tables
- Export/import data

### Launch Prisma Studio

**Option 1: Using npm script (Recommended)**
```bash
npm run studio
# or
npm run db:studio
```

**Option 2: Using Prisma CLI directly**
```bash
npx prisma studio
```

The studio will open in your browser at **http://localhost:5555**

---

## 📊 Available Database Commands

Add these to your workflow:

```bash
# View/edit database with visual interface
npm run studio

# Sync Prisma schema with database
npm run db:push

# Seed database with sample data
npm run db:seed

# Create and run migrations (with file creation)
npm run db:migrate

# Generate Prisma Client
npx prisma generate
```

---

## 🔍 Using Prisma Studio

### 1. **Viewing Data**
- Open Prisma Studio (`npm run studio`)
- Select a table from the left sidebar
- View all records in that table
- Click any record to see detailed information

### 2. **Filtering & Searching**
- Use the search bar to find specific records
- Click "Add filter" to filter by field values
- Combine multiple filters for complex queries

### 3. **Creating Records**
- Click "Add record" button
- Fill in the required fields
- Prisma Studio will validate relationships
- Click "Save"

### 4. **Editing Records**
- Click on any record to view details
- Modify fields as needed
- Changes are saved automatically

### 5. **Deleting Records**
- Click on a record
- Click "Delete" button
- Confirm deletion

---

## 📋 Your Database Tables

### Core Tables
- **User** - Stores user accounts (students, instructors, admins)
- **Course** - Course information and metadata
- **Section** - Course sections/chapters
- **Lesson** - Individual lessons within sections
- **Category** - Course categories

### Learning & Progress
- **Enrollment** - Student course enrollments
- **LessonProgress** - Track lesson completion
- **Quiz** - Quiz/assessment questions
- **QuizAttempt** - Quiz attempt records
- **Certificate** - Course certificates

### Commerce
- **Order** - Purchase orders
- **Review** - Course reviews and ratings
- **Wishlist** - Student wish lists

### Admin
- **Notification** - System notifications
- **Payout** - Instructor payouts

---

## 🛠️ Advanced: Other Database Tools

### Option 1: pgAdmin (Web-based PostgreSQL Admin)
A more feature-rich PostgreSQL management tool.

**Installation:**
```bash
# Using Docker (easiest)
docker run -p 5050:80 -e PGADMIN_DEFAULT_EMAIL=admin@example.com -e PGADMIN_DEFAULT_PASSWORD=admin dpage/pgadmin4
```

Then access at: `http://localhost:5050`

**Or install locally:**
- Download from: https://www.pgadmin.org/download/
- Install and follow setup wizard

### Option 2: DBeaver (Desktop Database Tool)
Powerful desktop application for database management.

**Installation:**
- Download from: https://dbeaver.io/download/
- Free Community Edition available
- Supports PostgreSQL and many other databases

**Connection Settings:**
- Host: localhost
- Port: 5432
- Database: pg_db
- User: postgres
- Password: sikku321

### Option 3: VS Code Extensions
Add these extensions for quick database access without leaving your editor:

**PostgreSQL Explorer** (`ms-ossdata.vscode-postgresql`)
```bash
# Or search in VS Code Extensions marketplace
```

**SQLTools** (`mtxr.sqltools`)
- Provides SQL IDE in VS Code
- Query builder
- Database explorer

---

## 📝 Common Database Operations

### Reset Database (Development Only)
```bash
# WARNING: This deletes all data!
npx prisma migrate reset
```

### View Database Schema
```bash
# Opens schema visualization
npx prisma studio
# Or check the schema at: prisma/schema.prisma
```

### Export Database Data
Using Prisma Studio:
1. Open the table
2. Select records
3. Export as CSV/JSON (if available in your version)

Alternatively, use PostgreSQL backup:
```bash
pg_dump -U postgres -d pg_db > backup.sql
```

### Import Database Data
```bash
psql -U postgres -d pg_db < backup.sql
```

### Check Database Connection
```bash
# Test connection from Node
npx prisma db execute --stdin < /dev/null
# Or check .env DATABASE_URL is correct
cat .env
```

---

## 🔧 Environment Setup Reminder

Your database credentials in `.env`:
```
DATABASE_URL="postgresql://postgres:sikku321@localhost:5432/pg_db?schema=public"
```

**Important:** Never commit `.env` to Git!

---

## 🐛 Troubleshooting

### Prisma Studio won't open
```bash
# Ensure database is running
# Windows: Check PostgreSQL service is started
# Try regenerating Prisma Client
npx prisma generate
# Then try again
npm run studio
```

### Connection refused error
- Ensure PostgreSQL service is running
- Check DATABASE_URL in .env is correct
- Verify username and password

### Data not showing
```bash
# Regenerate Prisma Client
npx prisma generate

# Sync schema with database
npm run db:push

# Then open studio again
npm run studio
```

### Permission denied
```bash
# Ensure database user has correct permissions
# Connect via psql and grant privileges
psql -U postgres -d pg_db
# Then run: GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
```

---

## 💡 Best Practices

1. **Always backup before major changes**
   ```bash
   pg_dump -U postgres -d pg_db > backup_$(date +%Y%m%d).sql
   ```

2. **Use migrations for schema changes**
   ```bash
   npm run db:migrate
   ```

3. **Keep seed data updated** - Update `prisma/seed.ts` when adding test data

4. **Regular monitoring** - Use Prisma Studio to monitor data in development

5. **Version control** - Always version your `prisma/schema.prisma` file

---

## 📚 Resources

- **Prisma Documentation**: https://www.prisma.io/docs/
- **Prisma Studio Docs**: https://www.prisma.io/docs/concepts/prisma-studio
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **pgAdmin Documentation**: https://www.pgadmin.org/docs/

---

## Quick Reference

| Task | Command |
|------|---------|
| **Open Database Studio** | `npm run studio` |
| **Sync Schema** | `npm run db:push` |
| **Add Test Data** | `npm run db:seed` |
| **Create Migration** | `npm run db:migrate` |
| **Regenerate Client** | `npx prisma generate` |
| **Reset Database** | `npx prisma migrate reset` |

---

**Last Updated**: December 19, 2025

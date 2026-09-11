# Database Architecture - ProGemini LMS

## 📊 Database Tools Available

```
Your Local Development
│
├─ Prisma Studio (Recommended) ⭐
│  ├─ Visual Database Editor
│  ├─ Access: http://localhost:5555
│  ├─ Command: npm run studio
│  └─ Best for: Quick data viewing & CRUD operations
│
├─ pgAdmin (Optional)
│  ├─ Advanced PostgreSQL Admin
│  ├─ Access: http://localhost:5050
│  ├─ More features than Prisma Studio
│  └─ Best for: Advanced queries & monitoring
│
├─ DBeaver (Optional)
│  ├─ Desktop Database Client
│  ├─ Multi-database support
│  └─ Best for: Complex database management
│
└─ PostgreSQL Direct CLI
   ├─ Command: psql -U postgres -d pg_db
   └─ Best for: Raw SQL queries
```

---

## 🗄️ Database Schema Overview

```
PostgreSQL (localhost:5432)
└── pg_db (Database)
    └── public (Schema)
        │
        ├─ USER MANAGEMENT
        │  └─ User (users table)
        │
        ├─ COURSE CONTENT
        │  ├─ Course
        │  ├─ Section
        │  ├─ Lesson
        │  └─ Category
        │
        ├─ LEARNING TRACKING
        │  ├─ Enrollment
        │  ├─ LessonProgress
        │  ├─ Quiz
        │  └─ QuizAttempt
        │
        ├─ ASSESSMENT & CERTIFICATES
        │  └─ Certificate
        │
        ├─ E-COMMERCE
        │  ├─ Order
        │  ├─ Review
        │  └─ Wishlist
        │
        └─ ADMIN & NOTIFICATIONS
           ├─ Notification
           └─ Payout
```

---

## 🔄 Data Flow

```
User Interface (Next.js Frontend)
    ↓
NextAuth.js (Authentication)
    ↓
API Routes (/api/*)
    ↓
Prisma Client
    ↓
PostgreSQL Database
    ↓
Prisma Studio (View/Edit Data)
```

---

## 📈 Connection Details

```
Host:     localhost
Port:     5432
Database: pg_db
User:     postgres
Password: sikku321
Schema:   public
```

---

## 🚀 Quick Commands Reference

### For Developers

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run studio` | Open Prisma Studio (Database GUI) |
| `npm run db:push` | Sync schema with database |
| `npm run db:seed` | Add test data |
| `npm run db:migrate` | Create schema migration |

### Database Audit Trail

| Action | How | Tool |
|--------|-----|------|
| **View all tables** | Click table in sidebar | Prisma Studio |
| **View records** | Select table, scroll records | Prisma Studio |
| **Search data** | Use search/filter box | Prisma Studio |
| **Create record** | Click "Add record" | Prisma Studio |
| **Edit record** | Click record, modify fields | Prisma Studio |
| **Delete record** | Click record, click "Delete" | Prisma Studio |
| **Run SQL** | Open SQL editor | pgAdmin/DBeaver |
| **Monitor changes** | Check audit logs | pgAdmin |
| **Export data** | Table export options | pgAdmin/DBeaver |

---

## 🔍 Monitoring Database Changes

### Method 1: Prisma Studio (Easiest)
```bash
npm run studio
```
- Open browser to http://localhost:5555
- Tables on left, records in center
- All changes are visible immediately
- No code required

### Method 2: PostgreSQL Logs
```bash
# View PostgreSQL logs (if configured)
tail -f /var/log/postgresql/postgresql.log
# Note: This varies by OS and PostgreSQL setup
```

### Method 3: Database Triggers (Advanced)
Create audit tables to track changes:
```sql
-- Example: Create audit table
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(255),
  operation VARCHAR(10),
  changed_at TIMESTAMP DEFAULT NOW(),
  old_values JSONB,
  new_values JSONB
);
```

---

## 📋 Your 15 Tables Explained

### 1. **User** (Authentication & User Data)
```
Columns: id, email, password, name, role, bio, profileImage, createdAt, updatedAt
Purpose: Store user accounts and profile info
Users Can Be: ADMIN, INSTRUCTOR, STUDENT
```

### 2. **Course** (Course Metadata)
```
Columns: id, title, slug, description, price, rating, status, instructorId, ...
Purpose: Main course information
Relationships: Many sections, many enrollments, many reviews
```

### 3. **Section** (Course Structure)
```
Columns: id, title, description, order, courseId
Purpose: Group lessons into sections/chapters
Parent: Course
Child: Lessons
```

### 4. **Lesson** (Individual Content)
```
Columns: id, title, description, videoUrl, order, sectionId
Purpose: Individual lesson content
Parent: Section
Tracking: LessonProgress
```

### 5. **Category** (Course Categories)
```
Columns: id, name, description, icon
Purpose: Categorize courses
Child: Many Courses
```

### 6. **Enrollment** (Student Registration)
```
Columns: id, studentId, courseId, status, enrolledAt, completedAt
Purpose: Track which students enrolled in which courses
Relationships: User → Course
```

### 7. **LessonProgress** (Learning Tracking)
```
Columns: id, studentId, lessonId, completed, progress, watchedAt
Purpose: Track student progress in each lesson
```

### 8. **Order** (E-commerce)
```
Columns: id, studentId, courseId, amount, status, stripePaymentId
Purpose: Track purchases
Status: PENDING, COMPLETED, FAILED, REFUNDED
```

### 9. **Review** (Course Reviews)
```
Columns: id, courseId, studentId, rating, comment, isApproved
Purpose: Student course reviews and ratings
Filters: Only approved reviews show to public
```

### 10. **Wishlist** (Saved Courses)
```
Columns: id, studentId, courseId, addedAt
Purpose: Students save courses for later
```

### 11. **Quiz** (Assessments)
```
Columns: id, title, description, courseId, passingScore
Purpose: Quiz/exam questions
Child: QuizAttempts
```

### 12. **QuizAttempt** (Quiz Results)
```
Columns: id, studentId, quizId, score, answers, attemptedAt
Purpose: Track quiz attempts and scores
```

### 13. **Certificate** (Completion)
```
Columns: id, studentId, courseId, issuedAt, certificateUrl
Purpose: Course completion certificates
```

### 14. **Notification** (System Alerts)
```
Columns: id, userId, title, message, type, isRead, createdAt
Purpose: System notifications for users
Types: INFO, WARNING, SUCCESS, ERROR
```

### 15. **Payout** (Instructor Payments)
```
Columns: id, instructorId, amount, status, processedAt
Purpose: Track instructor earnings and payouts
Status: PENDING, PROCESSED, FAILED
```

---

## 🎯 Common Audit Queries (Using Prisma Studio)

### Find All Active Courses
1. Open Prisma Studio: `npm run studio`
2. Click "Course" table
3. Filter: `status = ACTIVE`

### Check User Enrollments
1. Click "User" table
2. Find specific user
3. Click "Enrollments" relation

### View Course Reviews
1. Click "Review" table
2. Filter: `isApproved = true`
3. Sort by rating (highest/lowest)

### Track Student Progress
1. Click "LessonProgress" table
2. Filter: `studentId = [specific student]`
3. See completion percentage

### Monitor Orders
1. Click "Order" table
2. Filter: `status = COMPLETED`
3. See total revenue

---

## ⚠️ Safety Tips

✅ **DO:**
- Use Prisma Studio for viewing data
- Regular backups before major changes
- Test changes on development database first
- Document any manual changes made

❌ **DON'T:**
- Delete production data without backup
- Run migrations without testing first
- Share .env credentials
- Modify database directly (use Prisma migrations instead)

---

## 📱 Access Points

| Tool | URL | Command | Purpose |
|------|-----|---------|---------|
| **Next.js App** | http://localhost:3000 | `npm run dev` | Main application |
| **Prisma Studio** | http://localhost:5555 | `npm run studio` | Database GUI |
| **pgAdmin** | http://localhost:5050 | See guide | Advanced admin |
| **PostgreSQL** | localhost:5432 | `psql` | Direct access |

---

## 🐛 Troubleshooting Database Issues

### Problem: "Connection refused"
**Solution:**
```bash
# Ensure PostgreSQL is running
# Windows: Start PostgreSQL service
# macOS: brew services start postgresql
# Linux: sudo service postgresql start

# Check connection
npm run studio
```

### Problem: "Table doesn't exist"
**Solution:**
```bash
# Sync schema
npm run db:push

# Then try again
npm run studio
```

### Problem: "Permission denied"
**Solution:**
```bash
# Grant permissions to postgres user
psql -U postgres -d pg_db -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;"
```

### Problem: "Prisma Client out of date"
**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Then restart your app
npm run dev
```

---

**Created**: December 19, 2025
**Last Updated**: December 19, 2025

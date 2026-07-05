# TaskFlow — Employee Task Management System

A full-stack task management system built for the Full Stack Developer Assignment brief: role-based authentication, admin/employee dashboards, task CRUD with file attachments, notifications, and exportable reports (Excel, CSV, PDF preview).

## Tech Stack

**Frontend**
- React + Redux Toolkit (state management)
- React Router (routing)
- React Hook Form + Yup (form validation)
- Tailwind CSS (styling)
- react-icons, date-fns
- jsPDF + jspdf-autotable (client-side PDF report generation)
- SheetJS (`xlsx`) (client-side Excel preview parsing)

**Backend**
- Node.js + Express
- Sequelize ORM + MySQL
- JWT-based authentication
- Multer (file uploads)
- ExcelJS (server-side Excel report generation)
- fast-csv (server-side CSV report generation)

**Architecture pattern (backend):** Route → Controller → Service → Repository → DAO → Model, keeping HTTP concerns, business rules, and data access cleanly separated.

## Features

### ✅ Authentication
- Registration with Full Name, Email, Password, Confirm Password, Role (Admin / Employee)
- Email uniqueness validation
- Password policy: minimum 8 characters, at least one uppercase, one lowercase, one number
- JWT-based login/logout
- Role-based route protection (`protect`, `adminOnly` middleware)

### ✅ Dashboards
- **Admin:** total employees, total tasks, completed tasks, pending tasks
- **Employee:** my tasks, completed, pending, overdue tasks

### ✅ Employee Management (Admin only)
- Add, edit, delete, search, sort, and paginate employees
- Fields: Name, Email, Department, Designation

### ✅ Task Management
- Full CRUD: create, update, delete, view
- Fields: Title, Description, Priority, Status, Start Date, Due Date, Assigned Employee
- Business rules enforced server-side (not just hidden in the UI):
  - Due Date cannot be earlier than Start Date
  - Completed tasks cannot be edited
  - Employees can only update the `status` field on their own tasks — attempts to change title, dates, priority, or assignee are rejected
  - Employees only ever see their own tasks; admins see all tasks
- Search, filter (status/priority), sort, and pagination on the task list

### ✅ File Uploads
- Accepts PDF, JPG, PNG, up to 5 MB per task attachment
- In-app preview for images and PDFs, direct link for other types

### ✅ Notifications
- Triggered on task assignment, task completion, and task reassignment
- In-app notification records created via `notificationRepository`
- **Email delivery is stubbed via `notificationService.sendEmail` and not yet wired to a real provider (e.g. SMTP/SendGrid) — planned as a near-term follow-up, not part of this submission.**

### ✅ Reports
- Report types: Completed Tasks, Pending Tasks, Employee-wise Tasks
- Export formats: **Excel (.xlsx)**, **CSV**, plus **JSON and PDF in-app preview** (PDF generated client-side via jsPDF; Excel/CSV previews render inline without requiring a download, in addition to the standard download flow)

### 🔜 Bonus Items — Status
| Bonus feature | Status |
|---|---|
| Remember Me | ✅ Implemented |
| Notifications (in-app) | ✅ Implemented |
| Email Notifications | 🔜 Planned — hook point exists (`notificationService.sendEmail`), provider integration pending |
| File Upload (PDF/JPG/PNG, max 5MB) | ✅ Implemented |
| Export to Excel/CSV | ✅ Implemented (plus PDF/JSON preview) |
| Unit Testing | 🔜 Not yet added |
| Docker Setup | 🔜 Not yet added |

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### 1. Database Setup
```bash
mysql -u root -p < schema.sql
```
This creates the `task_management` database along with `Users`, `Tasks`, and `Notifications` tables, plus one sample admin and one sample employee account.

> If you're upgrading an existing database created before the `startDate`/`dueDate` timezone fix, run the migration instead of (or in addition to) `schema.sql`:
> ```bash
> mysql -u root -p task_management < migrations/fix-task-dateonly-columns.sql
> ```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
DB_NAME=task_management
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

PORT=5000
```

Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000
```

Run the dev server:
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Log in, returns JWT | Public |
| GET | `/tasks` | List tasks (filtered/paginated) | Authenticated |
| GET | `/tasks/stats` | Task stats for dashboard | Authenticated |
| GET | `/tasks/:id` | Get a single task | Authenticated |
| POST | `/tasks` | Create a task | Admin only |
| PUT | `/tasks/:id` | Update a task | Authenticated (field-level restriction for employees) |
| DELETE | `/tasks/:id` | Delete a task | Admin / task creator |
| GET | `/employees` | List employees | Admin only |
| POST | `/employees` | Add an employee | Admin only |
| PUT | `/employees/:id` | Edit an employee | Admin only |
| DELETE | `/employees/:id` | Delete an employee | Admin only |
| GET | `/reports?type=&format=` | Generate a report (`json`/`excel`/`csv`) | Authenticated |

## Project Structure

```
backend/
├── config/          # Sequelize/database config
├── controllers/      # Request handling, validation errors → responses
├── services/         # Business logic, notification triggers
├── repositories/      # Authorization + business rules per entity
├── daos/             # Sequelize queries
├── models/           # Sequelize models
├── middlewares/       # auth (JWT), upload (Multer), role guards
├── routes/
└── migrations/

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/       # TaskList, TaskCard, TaskForm, TaskDetail
│   │   ├── reports/     # ReportGenerator
│   │   ├── common/
│   │   └── AdminDashboard.jsx, EmployeeDashboard.jsx
│   ├── store/slices/     # Redux Toolkit slices (task, employee, auth)
│   └── utils/           # dateUtils (UTC-safe date formatting)
```

## Notes on Testing / Verification

All core functionality listed in the assignment spec has been manually verified end-to-end, including:
- Registration/login with password policy and duplicate-email validation
- Role-based dashboard content and route access
- Employee CRUD with search/sort/pagination
- Task CRUD, including the Due Date ≥ Start Date rule and the completed-task edit lock
- Employee-side status-only updates (title/date/priority/assignee changes correctly rejected)
- File attachment upload, size/type limits, and in-app preview
- In-app notification creation on assign/complete/reassign
- Report generation and export across JSON, Excel, CSV, and PDF, including in-app preview without requiring a download

Known follow-up items before this is considered fully production-ready: real email delivery for notifications, automated unit tests, and a Docker Compose setup for one-command local spin-up.

## License

This project was built as part of a technical assessment and is not licensed for redistribution.
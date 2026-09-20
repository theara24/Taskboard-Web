# TaskBoard Web — Jira-Inspired Project & Issue Management UI

A modern, high-performance, single-page frontend web application inspired by Jira for managing agile projects, Kanban boards, issue lifecycles, and team discussions. Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Zustand**.

---

## 1. Project Overview

**TaskBoard Web** is an independent, frontend-only client designed to give software engineering teams an intuitive workspace for sprint tracking and backlog management. It features an interactive **drag-and-drop Kanban board**, comprehensive issue lifecycle handling (Backlog, Todo, In Progress, Done), threaded discussions with real-time editing, multi-criteria filtering, and local persistence via `localStorage`.

### Key Characteristics
- **100% Client-Side**: No backend, database, or external REST API required. Runs entirely in modern web browsers.
- **Stateful & Persistent**: Automatically hydrates from and syncs with `localStorage`. All user changes (created projects, newly added issues, moved cards, comments) remain intact after browser reloads.
- **Rich Interactive Drag-and-Drop**: Built using `@hello-pangea/dnd` for smooth, accessible reordering and status column transitions.
- **Production-Grade SaaS Design**: Responsive layout, collapsible navigation drawer, breadcrumbs, toasts, and accessible modals.

---

## 2. Features

### 🔐 Simulated Authentication & Personas
- Dedicated `/login` and `/register` pages with form validation.
- One-click demo persona switcher (Admin, Frontend Lead, Backend Architect, Product Manager, QA Engineer).
- Protected route wrappers enforcing active session before accessing app workspaces.

### 📊 Metric-Rich Dashboard (`/dashboard`)
- KPI summary cards (Total Projects, Total Issues, Open Issues, Completed Issues, Urgent/Critical issues).
- Dynamic multi-segment progress bar showing distribution across Backlog, To Do, In Progress, and Done.
- Live feed of recently updated issues with instant access.

### 📁 Project Management (`/projects`)
- Grid of interactive project cards with real-time completion progress bars and member avatars.
- Modal to create projects with unique alphanumeric project keys (e.g. `WEB`, `MOB`, `PORT`).
- Edit project name and description; delete project with safe confirmation dialog.
- Project Settings page (`/projects/:id/settings`) for member invitations and role management.

### 📋 Interactive Kanban Board (`/projects/:projectId/board`)
- 4 Kanban columns: `BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`.
- Fluid drag-and-drop card movement across columns.
- Real-time status update synchronized to local state.
- Quick issue creation button directly within column headers.

### 🔍 Search & Multi-Criteria Filtering
- Real-time full-text search by title, issue key, or description.
- Instant dropdown filters:
  - By **Status** (Backlog, To Do, In Progress, Done)
  - By **Priority** (Critical, High, Medium, Low)
  - By **Type** (Task, Bug, Feature)
  - By **Assignee** (Project members)
  - By **Label** (Project-scoped tags)
- Configurable sorting (Updated Date, Created Date, Due Date, Priority, Title).

### 📑 Tabular Issue List (`/projects/:projectId/issues`)
- Comprehensive table view with column sorting.
- Client-side pagination (10 items per page with page controls).
- Click any row to open the complete issue details modal.

### 🎫 Detailed Issue Modal (`/issues/:issueId`)
- View and edit summary, description, and metadata in place.
- Interactive status, priority, type, and assignee dropdowns.
- Threaded comments section (add, edit, and author-only delete).
- Immutable activity history timeline tracking state changes.

### 👤 Profile & Analytics (`/profile`)
- User details and active role badge (`ADMIN` / `USER`).
- Personal workload metrics (assigned issues, resolved work, critical items).
- Instant demo persona switcher.

---

## 3. Technology Stack

| Category | Library / Tool | Description |
|---|---|---|
| **Framework** | React 18 | Declarative component UI library |
| **Language** | TypeScript | Strict type safety and clear domain models |
| **Build Tool** | Vite | Lightning-fast development server and optimized bundler |
| **Styling** | Tailwind CSS | Utility-first responsive design with `@tailwindcss/forms` |
| **Routing** | React Router v6 | Client-side routing with nested layouts and protected guards |
| **State** | Zustand | Scalable, boilerplate-free state management with persist middleware |
| **Drag & Drop** | `@hello-pangea/dnd` | Accessible, smooth Kanban board drag-and-drop |
| **Forms** | React Hook Form & Zod | Performant form controls with strict schema validation |
| **Icons** | Lucide React | Clean, modern feather-style iconography |

---

## 4. Project Structure

```
taskboard-web/
├── src/
│   ├── components/
│   │   ├── board/
│   │   │   ├── IssueCard.tsx        # Draggable card with tags and priority
│   │   │   ├── KanbanBoard.tsx      # DragDropContext container
│   │   │   └── KanbanColumn.tsx     # Droppable column
│   │   ├── common/
│   │   │   ├── Badge.tsx            # PriorityBadge, StatusBadge, IssueTypeBadge
│   │   │   ├── Button.tsx           # Primary, secondary, danger, ghost variants
│   │   │   ├── ConfirmDialog.tsx    # Delete confirmation modal
│   │   │   ├── EmptyState.tsx       # Zero-data presentation screen
│   │   │   ├── Modal.tsx            # Accessible modal dialog with backdrop
│   │   │   ├── ToastContainer.tsx   # Stack of temporary alert notifications
│   │   │   └── UserAvatar.tsx       # Avatar or initials with fallback palette
│   │   ├── issues/
│   │   │   ├── FilterBar.tsx        # Search, dropdown filters, and sort selector
│   │   │   ├── IssueDetailModal.tsx # Full issue viewer, comments, and activities
│   │   │   └── IssueFormModal.tsx   # Create / Edit issue form with Zod validation
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx        # Main shell connecting Navbar, Sidebar, and Modals
│   │   │   ├── Breadcrumbs.tsx      # Contextual location trail
│   │   │   ├── Navbar.tsx           # Top navigation, global search, user switcher
│   │   │   └── Sidebar.tsx          # Collapsible responsive navigation drawer
│   │   └── projects/
│   │       ├── ProjectCard.tsx      # Project summary card with progress bar
│   │       └── ProjectFormModal.tsx # Create / Edit project modal
│   ├── mock/
│   │   └── initial-data.ts          # Pre-seeded projects, issues, comments, labels
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx        # Sign-in simulation with quick demo buttons
│   │   │   └── RegisterPage.tsx     # New account registration form
│   │   ├── DashboardPage.tsx        # Metrics dashboard and recent issues
│   │   ├── IssueDetailPage.tsx      # Standalone issue route handler
│   │   ├── IssuesListPage.tsx       # Filterable tabular issue list
│   │   ├── KanbanBoardPage.tsx      # Interactive Kanban board
│   │   ├── ProfilePage.tsx          # Account settings and assigned metrics
│   │   ├── ProjectsPage.tsx         # Projects directory grid
│   │   └── ProjectSettingsPage.tsx  # Project metadata and member management
│   ├── store/
│   │   ├── authStore.ts             # User session and persona management
│   │   ├── issueStore.ts            # Issues, comments, labels, and activities
│   │   ├── projectStore.ts          # Projects and team members
│   │   └── uiStore.ts               # Search queries, filters, modals, and toasts
│   ├── types/
│   │   └── index.ts                 # TypeScript domain interfaces
│   ├── utils/
│   │   ├── cn.ts                    # Class name merger
│   │   └── storage.ts               # LocalStorage wrapper
│   ├── App.tsx                      # Route declarations
│   ├── index.css                    # Tailwind directives and custom scrollbars
│   └── main.tsx                     # DOM root mount
├── index.html                       # HTML template with Inter typography
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Theme extensions and color palettes
├── tsconfig.json                    # Strict TypeScript configuration
└── vite.config.ts                   # Vite bundler configuration
```

---

## 5. Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later)
- [npm](https://www.npmjs.com/) (version 9 or later)

### Quick Start
```bash
# 1. Navigate to the frontend directory
cd taskboard-web

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at:
```
http://localhost:5173
```

---

## 6. Pre-Seeded Demo Data

TaskBoard Web includes comprehensive initial demo data:

### Projects:
1. **Website Redesign (`WEB`)**: 6 issues covering responsive fixes, dark mode, performance optimization, and accessibility audits.
2. **Mobile Banking App (`MOB`)**: 4 issues covering biometric authentication, transaction pagination, and EMVCo QR code scanner.
3. **University Portal (`PORT`)**: 3 issues covering course registration concurrency locks, transcript PDF generation, and reminders.

### Demo User Accounts:
- **Sarah Connor** (`admin@taskboard.io`) — System Administrator
- **Alice Johnson** (`alice@example.com`) — Frontend Lead
- **Bob Smith** (`bob@example.com`) — Backend Architect
- **Charlie Brown** (`charlie@example.com`) — Product Manager
- **Dara Seng** (`dara@example.com`) — QA Engineer

You can instantly switch between these accounts anytime using the user avatar menu in the top navigation bar or from the `/profile` page!

---

## 7. LocalStorage Persistence

State is managed by **Zustand** and automatically persisted into browser `localStorage` under these keys:
- `taskboard_auth_v1`: Active user session and custom registered users.
- `taskboard_projects_v1`: Projects list and member rosters.
- `taskboard_issues_v1`: All issues, threaded comments, labels, and audit activities.

To reset the application to its clean demo state at any time, open your browser DevTools (F12) > Application > Local Storage > Clear All, or run `localStorage.clear()` in the Console and refresh the page.

---

## 8. Building for Production

To create an optimized production build:
```bash
npm run build
```

To preview the built production bundle locally:
```bash
npm run preview
```

---

## 9. Academic Presentation Talking Points

When presenting this frontend application to your university professor:

1. **Clean Component Decomposition**:
   - Reusable atom components (`Badge`, `Button`, `Modal`, `UserAvatar`) promote DRY design.
   - Domain containers (`KanbanBoard`, `IssueCard`, `FilterBar`) stay decoupled from raw API or data-fetching logic.

2. **State Management with Zustand**:
   - Clean, lightweight alternative to Redux without boilerplate actions or reducers.
   - Stores are split logically by domain (`authStore`, `projectStore`, `issueStore`, `uiStore`).

3. **Drag-and-Drop Implementation**:
   - Implemented using `@hello-pangea/dnd` with optimistic UI updates.
   - When a card is dropped into a new column, the issue status is updated instantly in state, appended to the activity history audit log, and saved to `localStorage`.

4. **Responsive SaaS Design**:
   - Mobile navigation drawer for tablets and phones.
   - Kanban board supports horizontal scrolling on smaller screens.
   - Consistent typography and high-contrast accessibility standards.

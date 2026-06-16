# ArchiScaler

ArchiScaler is a tool to design systems and plan scaling based on requirements. It allows you to draw your project architecture by using provided components like clients, databases, load balancers, servers, and caches, and simulate requests per second (RPS) loads.

## Features

- Interactive Canvas: Drag, drop, and link system components including Clients, Web Servers, Databases, Load Balancers, and Caches.
- Connection Validation: Built-in Directed Acyclic Graph (DAG) validation to enforce top-down traffic propagation and avoid cycles.
- RPS Simulation Engine: Define target load (RPS) at the client entry point and see traffic distribute across all components, highlighting bottlenecks when utilization reaches or exceeds 100%.
- Authentication: Secure registration and login flow using bcrypt hashing and JSON Web Tokens.
- DB Persistence: Save and load multiple system architectures from a PostgreSQL database.

## Project Structure

```
.
├── backend
│   ├── package.json
│   ├── package-lock.json
│   ├── .env (configuration file)
│   └── src
│       ├── index.js (server entrypoint)
│       ├── pool.js (PostgreSQL database pool)
│       ├── middleware
│       │   └── auth.js (JWT validation middleware)
│       ├── routes
│       │   ├── auth.js (registration and login routes)
│       │   ├── projects.js (CRUD for architectures, simulation trigger)
│       │   └── users.js (user profile details)
│       └── simulator
│           ├── index.js (simulator coordinator)
│           ├── buildGraph.js (constructs adjacency lists)
│           ├── propagateTraffic.js (topological sort traffic calculator)
│           ├── utilization.js (calculates resource utilization ratios)
│           └── test.js (local CLI verification tests)
├── docs (documentation files)
├── frontend
│   ├── package.json
│   ├── package-lock.json
│   └── src
│       ├── components
│       │   └── CustomNodes.js (Client, Server, DB, LB, Cache React Flow renderers)
│       └── app
│           ├── globals.css (styles and theme configuration)
│           ├── layout.js (Next.js HTML layout)
│           ├── page.js (Welcome Page)
│           ├── auth
│           │   └── page.js (Login/Register Forms)
│           └── home
│               └── page.js (Main System Design Workspace Canvas)
└── README.md
```

## Running the Project

### Database Setup

Ensure you have a PostgreSQL server running locally. Create a database named archiscaler. The database tables should have columns structure matching:
- users: user_id (uuid), username (varchar), email (varchar), password_hash (text)
- projects: project_id (uuid), user_id (uuid), name (varchar), archi_json (jsonb)

### Backend

1. Navigate to the backend directory.
2. Ensure you have a .env file with parameters like DB_HOST, DB_USER, DB_NAME, DB_PORT, JWT_SECRET, and PORT.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the Express server:
   ```bash
   node src/index.js
   ```

### Frontend

1. Navigate to the frontend directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to http://localhost:3000 to launch the application.

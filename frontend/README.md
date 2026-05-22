Task-Reminder

Brief: A task management application featuring a React + TypeScript (Vite) frontend and a lightweight Node.js + TypeScript backend. The project supports user authentication, avatar uploads, and user activity 
statistics.

Contents

Description

Quick Start

NPM Scripts

Project Structure

Environment Variables

Avatar Uploads

Schemas and Types

Testing

Development Tips

Future Improvements

Contributing

License

Description

Task-Reminder is an interactive interface for managing personal productivity. Key features include:

User registration and secure authentication (JWT).

Full Task Management (CRUD: Create, Read, Update, Delete).

Profile customization with avatar uploads.

Automated tracking of user statistics.

The project is decoupled into a client (src/) and a server (server/).

Quick Start (Local)

Clone the repository:

bash

git clone <repo-url>

cd Task-Reminder


Install dependencies for both frontend and backend:

bash

# Install frontend deps

npm install

# Install backend deps

cd server

npm install

cd ..


Launch the application (requires two terminal tabs):Terminal 1 (Frontend):

bash

npm run dev

Typically available at http://localhost:5173Terminal 2 (Backend):

bash

cd server

npm run dev


NPM Scripts (Root)

npm run dev — Starts the Vite development server.

npm run build — Compiles the frontend for production.

npm run preview — Previews the production build locally.

For server-specific commands, navigate to the /server directory.

Project Structure (High Level)

src/ — Frontend application (React)

src/components/ — UI components.

src/api/api.ts — API client configuration (Axios/Fetch).

src/store.ts — Global state management.

server/ — Backend application (Node.js)

server/server.ts — Entry point.

server/schemas/ — Data models (Tasks, Users, Stats).

server/types/ — Shared TypeScript interfaces.

server/uploads/ — Avatar storage and upload logic.

server/utils/ — Middleware (Auth validation, etc.).

Environment Variables

Create a .env file in the server/ directory:

PORT — Server port (default: 3000).

JWT_SECRET — Secret key for token signing.

UPLOAD_DIR — Path for avatars (default: server/uploads/avatars).

Avatar Uploads

Files are handled by server/uploads/avatarUpload.ts and stored in server/uploads/avatars. Ensure the directory exists and has write permissions in your production environment.

Schemas and Types

The backend relies on dedicated schemas:

taskSchema.ts — Task data structure.

userSchema.ts — User profiles.
userStatistics.ts — User activity logs.

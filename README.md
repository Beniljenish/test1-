# Organizo - React Task Management Application

A beautiful and functional task management application built with React.

## Features

- User authentication with form validation
- Interactive dashboard with calendar, tasks, categories, and time tracking
- Responsive design matching the original Organizo designs
- Protected routes and session management
- Modern React hooks and context API

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or extract this project
2. Navigate to the project directory:
   ```bash
   cd organizo-react
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Login

Use any email and password combination to login (demo authentication).

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── hooks/              # Custom React hooks
├── styles/             # Global styles and CSS variables
├── utils/              # Utility functions
├── App.js              # Main application component
└── index.js            # Application entry point
```

## Build

To build the app for production:

```bash
npm run build
```

## Technologies Used

- React 18
- React Router v6
- Context API for state management
- CSS3 with custom properties
- Lucide React for icons
- Date-fns for date manipulation

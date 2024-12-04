# Partitura

A modern Electron application for managing sheet music and practice sessions.

## Features

- Modern UI with React and TailwindCSS
- Dark/Light theme support
- Collapsible sidebar navigation
- TypeScript for type safety
- Electron for cross-platform desktop support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/partitura.git
cd partitura
```

2. Install dependencies
```bash
npm install
```

### Development

Run the app in development mode:
```bash
npm run electron:dev
```

### Building

Build the app for production:
```bash
npm run electron:build
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/       # React context providers
├── layouts/       # Layout components
├── pages/         # Page components
├── styles/        # Global styles
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Technologies

- React
- TypeScript
- Electron
- TailwindCSS
- Vite
- Lucide Icons 
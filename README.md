# Partitura

A modern sheet music management web application built with React, TypeScript, and Supabase.

## Features

- Sheet music library management
- Practice tracking
- Calendar integration
- Dark/light theme toggle
- Responsive design
- Available as a web app and Electron desktop app

## Live Demo

Visit the live demo at: [https://jasper557.github.io/partitura](https://jasper557.github.io/partitura)

## Project Structure

```
partitura/
├── public/           # Static assets
│   └── assets/       # Images and icons
├── src/              # Source code
│   ├── components/   # Reusable UI components
│   ├── config/       # Configuration files
│   ├── context/      # React context providers
│   ├── layouts/      # Page layout components
│   ├── pages/        # Application pages
│   ├── services/     # API and service functions
│   └── types/        # TypeScript type definitions
├── electron/         # Electron app configuration
└── supabase/         # Supabase configuration
```

## Development Setup

### Prerequisites

- Node.js >= 16
- npm or yarn

### Environment Variables

Create a `.env` file based on `.env.example`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PUBLIC_URL=your_public_url
```

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Electron Development

```bash
# Run Electron app in development mode
npm run electron:dev

# Build Electron app for production
npm run electron:build
```

## Deployment

The web app is automatically deployed to GitHub Pages:

```bash
npm run deploy
```

## License

MIT 
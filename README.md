# Partitura

A modern sheet music management web application built with React, TypeScript, and TailwindCSS.

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
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Main application pages
│   ├── services/        # API and business logic services
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component
│   └── index.tsx        # Application entry point
├── public/              # Static assets
└── electron/            # Electron app configuration (desktop)
```

## Shared Components

The application uses several shared components to reduce code duplication and maintain consistency:

- `ToggleSwitch`: A reusable toggle component for boolean settings
- `InfoBox`: A styled notification/info component with variant support
- `SettingRow`: A consistent layout for settings items

## Custom Hooks

- `useScrollReset`: Automatically resets scroll position when a page is mounted
- `useShortcuts`: Manages keyboard shortcuts throughout the application
- `useTheme`: Handles light/dark mode toggling and persistence

## Pages

- **SheetMusic**: Main page for managing and organizing sheet music files
- **Practice**: Tracking practice sessions and progress
- **Calendar**: Calendar view for scheduling practice and events
- **Settings**: Application preferences and user settings

## Development Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run lint`: Check for linting issues
- `npm run lint:fix`: Automatically fix linting issues
- `npm run analyze`: Analyze bundle size and dependencies
- `npm run electron:dev`: Start the Electron desktop app in development mode
- `npm run electron:build`: Build the Electron desktop app for distribution

## Keyboard Shortcuts

The application features customizable keyboard shortcuts for faster navigation and actions:

- General navigation shortcuts
- Sheet music management shortcuts
- PDF viewer controls

## Theme Support

The application supports both light and dark mode, with automatic detection of system preferences and the ability for users to override this setting.

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
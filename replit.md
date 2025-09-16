# APM Dashboard - Application Performance Monitoring

## Overview

This is a full-stack Application Performance Monitoring (APM) dashboard built to provide real-time monitoring and analysis of application metrics, errors, and alerts. The system offers comprehensive visibility into application health, response times, throughput, error rates, and system performance through an intuitive web interface with real-time updates via WebSocket connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses a modern React-based architecture with TypeScript:
- **React Router**: Uses Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching with automatic refetching
- **UI Framework**: shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming and dark mode support
- **Charts**: Chart.js for data visualization of metrics over time
- **Real-time Updates**: WebSocket integration for live data streaming

### Backend Architecture
The server implements a RESTful API with Express.js:
- **Framework**: Express.js with TypeScript for type safety
- **API Design**: RESTful endpoints for CRUD operations on applications, metrics, errors, and alerts
- **Real-time Communication**: WebSocket server for pushing live updates to connected clients
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes
- **Logging**: Request/response logging with performance metrics

### Data Storage
The application uses a flexible storage architecture:
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Database**: PostgreSQL with schema definitions for applications, metrics, errors, and alerts
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Fallback Storage**: In-memory storage implementation for development and testing

### Schema Design
- **Applications**: Core entities being monitored with health status and performance metrics
- **Metrics**: Time-series data for response times, throughput, error rates, and system resources
- **Errors**: Error tracking with stack traces, endpoints, and occurrence counts
- **Alerts**: Configurable alerting system with severity levels and acknowledgment workflow

### Development Experience
- **Build System**: Vite for fast development and optimized production builds
- **Development Server**: Hot module replacement and error overlay for rapid iteration
- **TypeScript**: Full type safety across client, server, and shared code
- **Path Aliases**: Organized imports with @ aliases for clean code structure

## External Dependencies

### Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe ORM for database operations
- **express**: Backend web framework
- **react**: Frontend UI library
- **typescript**: Type safety across the stack

### Database and Storage
- **@neondatabase/serverless**: Serverless PostgreSQL database
- **connect-pg-simple**: PostgreSQL session store
- **drizzle-kit**: Database migration and schema management

### UI and Design System
- **@radix-ui/react-***: Accessible UI primitives (dialog, dropdown, toast, etc.)
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Real-time Communication
- **ws**: WebSocket library for real-time updates

### Data Visualization
- **chart.js**: Charting library for metrics visualization
- **date-fns**: Date manipulation and formatting

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast bundling for production
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay

### Validation and Forms
- **zod**: Schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod
- **@hookform/resolvers**: Form validation resolvers

The architecture prioritizes real-time monitoring capabilities, type safety, and developer experience while maintaining scalability for production deployments.
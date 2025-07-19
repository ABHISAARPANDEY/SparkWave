# SparkWave - AI-Powered Social Media Automation Platform

## Overview

SparkWave is a modern web application that enables users to automate and schedule AI-generated daily text posts across multiple social media platforms (Instagram, LinkedIn, Facebook, Twitter/X). The platform follows a prompt-driven campaign approach where users create content themes that generate unique daily posts automatically.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom SparkWave design tokens
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: express-session with in-memory storage
- **Authentication**: Custom session-based auth with bcrypt password hashing
- **API Design**: RESTful endpoints with consistent error handling

### Database Layer
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless driver for serverless compatibility

## Key Components

### Authentication System
- Email/password registration and login
- OAuth integration planned for Google and LinkedIn
- Session-based authentication with secure cookie configuration
- Protected routes with middleware-based authorization

### Campaign Management
- Prompt-driven campaign creation with customizable parameters
- Multi-platform targeting (Instagram, LinkedIn, Twitter, Facebook)
- Content style selection (professional, inspirational, casual)
- Flexible scheduling with duration and timing controls

### AI Content Generation
- Integration with free AI models (Hugging Face Inference API)
- Support for GPT-2, GPT-Neo, and FLAN-T5 models
- Platform-specific content optimization
- Fallback generation for API limitations

### Post Scheduling System
- Automated post scheduling with Node.js setTimeout
- Queue management for multiple campaigns
- Status tracking (scheduled, published, failed)
- Retry mechanisms for failed posts

### Social Media Integration
- OAuth flows for platform authentication
- Platform-specific API integrations
- Token management with refresh capability
- Multi-platform publishing support

## Data Flow

1. **User Registration/Login**: Session creation with user authentication
2. **Campaign Creation**: User inputs prompt and preferences → AI generates content → Posts scheduled
3. **Content Generation**: Campaign prompt → AI model API → Platform-optimized content → Database storage
4. **Publishing Flow**: Scheduled time → Retrieve post → Platform API call → Update status
5. **Analytics Tracking**: Post metrics collection → Dashboard aggregation → User insights

## External Dependencies

### AI Services
- **Hugging Face Inference API**: Primary AI content generation
- **Fallback Strategy**: Local content templates when API unavailable
- **Model Support**: GPT-2, GPT-Neo-2.7B, FLAN-T5-Large

### Social Media APIs
- **Instagram Basic Display API**: Content posting and metrics
- **LinkedIn API**: Professional content publishing
- **Twitter API v2**: Tweet and thread management
- **Facebook Graph API**: Page and profile posting

### Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Session Storage**: In-memory (production should use Redis/PostgreSQL)
- **File Storage**: Local filesystem (scalable to cloud storage)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reloading**: Full-stack development with file watching
- **Environment Variables**: Local .env configuration

### Production Build
- **Frontend**: Vite production build with optimized bundles
- **Backend**: esbuild compilation to ES modules
- **Static Assets**: Served from Express with proper caching headers
- **Database**: Automatic migration deployment with Drizzle

### Scalability Considerations
- **Database**: Neon serverless scales automatically
- **AI Generation**: Rate limiting and queue management implemented
- **Session Storage**: Configurable for Redis in production
- **CDN Integration**: Ready for static asset optimization

### Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **Session Security**: HTTP-only cookies with CSRF protection
- **API Rate Limiting**: User-based request throttling
- **Input Validation**: Zod schema validation throughout
- **Environment Isolation**: Separate dev/prod configurations

The application is designed to start with free-tier services and scale to paid infrastructure as the user base grows, with particular emphasis on cost-effective AI generation and reliable social media publishing.
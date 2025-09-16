# APM Dashboard - Application Performance Monitoring

A comprehensive, real-time Application Performance Monitoring (APM) system built with React, Express.js, and PostgreSQL. Monitor your applications' health, performance metrics, errors, and alerts through an intuitive web dashboard with real-time updates.

## 🚀 Features

### Real-Time Monitoring
- **Live Metrics Dashboard** - Response times, throughput, error rates, CPU/memory usage
- **WebSocket Updates** - Real-time data streaming without page refreshes
- **Interactive Charts** - Time-series visualizations with customizable date ranges
- **Application Health** - Monitor multiple applications with status indicators

### Performance Tracking
- **Response Time Monitoring** - Track API endpoint performance
- **Throughput Analysis** - Monitor requests per second and traffic patterns
- **Error Rate Tracking** - Identify and track application errors
- **Resource Usage** - CPU and memory consumption monitoring

### External Application Integration
- **Metrics Ingestion API** - Endpoints for external applications to send performance data
- **Bulk Data Upload** - Efficient batch processing for high-volume metrics
- **Application Registration** - Simple onboarding for new applications
- **Error Reporting** - Comprehensive error tracking and analysis

### Alerting System
- **Configurable Alerts** - Set up custom alerts based on metrics thresholds
- **Multiple Alert Types** - CPU usage, response time, error rate, and custom alerts
- **Alert Management** - Acknowledge and manage alert lifecycle

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **TanStack Query** for efficient data fetching and caching
- **Chart.js** for interactive data visualizations
- **Tailwind CSS** with shadcn/ui components for modern UI
- **WebSocket** integration for real-time updates

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for reliable data persistence
- **WebSocket Server** for real-time communication
- **Zod** for request validation

### Database
- **PostgreSQL** with optimized schema design
- **Time-series data** handling for metrics storage
- **Efficient indexing** for fast query performance

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/nkaplan19/apm-dashboard.git
   cd apm-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Configure your database connection
   DATABASE_URL=postgresql://username:password@localhost:5432/apm_db
   SESSION_SECRET=your-session-secret-key
   PORT=5000
   ```

4. **Set up the database**
   ```bash
   # Push database schema
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the dashboard**
   - Open http://localhost:5000 in your browser
   - The dashboard will load with sample data

## 🏗️ Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── metrics-grid.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── application-health.tsx
│   │   │   └── charts/     # Chart components
│   │   ├── pages/          # Page components
│   │   │   └── dashboard.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── use-websocket.tsx
│   │   └── lib/            # Utilities and configurations
│   └── index.html
├── server/                 # Express.js backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── db.ts              # Database connection
│   └── index.ts           # Server entry point
├── shared/                 # Shared code between frontend/backend
│   └── schema.ts          # Database schema and validation
└── package.json
```

## 🔌 API Reference

### Metrics Ingestion

#### Register Application
```http
POST /api/ingest/register
Content-Type: application/json

{
  "name": "My Application",
  "description": "Application description",
  "version": "1.0.0",
  "environment": "production"
}
```

#### Send Bulk Metrics
```http
POST /api/ingest/metrics/bulk
Content-Type: application/json

{
  "applicationId": "app-uuid",
  "metrics": [
    {
      "responseTime": 245.5,
      "throughput": 1850,
      "errorRate": 0.5,
      "successRate": 99.5,
      "cpuUsage": 45.2,
      "memoryUsage": 67.8
    }
  ]
}
```

#### Send Bulk Errors
```http
POST /api/ingest/errors/bulk
Content-Type: application/json

{
  "applicationId": "app-uuid", 
  "errors": [
    {
      "errorType": "DatabaseError",
      "message": "Connection timeout",
      "endpoint": "/api/users",
      "stackTrace": "Error at line 42...",
      "count": 3
    }
  ]
}
```

### Dashboard API

#### Get Applications
```http
GET /api/applications
```

#### Get Metrics
```http
GET /api/metrics?applicationId=app-uuid&start=2024-01-01&end=2024-01-02
```

#### Get Errors
```http
GET /api/errors?applicationId=app-uuid&limit=50
```

#### Get Alerts
```http
GET /api/alerts?applicationId=app-uuid&acknowledged=false
```

## 🔄 Real-Time Features

The dashboard uses WebSocket connections for real-time updates:

- **Automatic Data Refresh** - Metrics update every 10 seconds
- **Live Notifications** - New errors and alerts appear instantly
- **Connection Resilience** - Automatic reconnection on network issues
- **Efficient Updates** - Only changed data is transmitted

## 📊 Monitoring Your Applications

### Integrating External Applications

To monitor your applications with this APM system:

1. **Register your application**
   ```javascript
   const response = await fetch('/api/ingest/register', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Your App Name',
       description: 'App description'
     })
   });
   const { applicationId } = await response.json();
   ```

2. **Send metrics periodically**
   ```javascript
   setInterval(async () => {
     await fetch('/api/ingest/metrics/bulk', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         applicationId: applicationId,
         metrics: [{
           responseTime: getAverageResponseTime(),
           throughput: getCurrentThroughput(),
           errorRate: getErrorRate(),
           cpuUsage: getCpuUsage(),
           memoryUsage: getMemoryUsage()
         }]
       })
     });
   }, 10000); // Send metrics every 10 seconds
   ```

3. **Report errors**
   ```javascript
   process.on('uncaughtException', async (error) => {
     await fetch('/api/ingest/errors/bulk', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         applicationId: applicationId,
         errors: [{
           errorType: error.constructor.name,
           message: error.message,
           stackTrace: error.stack,
           endpoint: getCurrentEndpoint(),
           count: 1
         }]
       })
     });
   });
   ```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your-production-db-url
   SESSION_SECRET=secure-session-secret
   PORT=5000
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

### Security Considerations

For production deployments, consider implementing:

- **API Authentication** - Add API keys for ingestion endpoints
- **Rate Limiting** - Prevent API abuse
- **HTTPS/TLS** - Secure data transmission
- **Input Validation** - Enhanced request validation
- **Access Controls** - User authentication and authorization

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Follow existing code style and conventions

## 📈 Performance

### Database Optimization

The system is optimized for high-performance metric ingestion:

- **Indexed queries** for fast data retrieval
- **Bulk insert operations** for efficient data ingestion
- **Connection pooling** for database scalability
- **Query optimization** for dashboard performance

### Scalability

- **Horizontal scaling** support with load balancers
- **Database sharding** capabilities for large datasets
- **Caching layers** for frequently accessed data
- **Microservice architecture** for component independence

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help or have questions:

- **Issues**: [GitHub Issues](https://github.com/nkaplan19/apm-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nkaplan19/apm-dashboard/discussions)
- **Documentation**: Check this README and inline code comments

## 🗺️ Roadmap

### Upcoming Features

- **Distributed Tracing** - Track requests across microservices
- **Advanced Alerting** - Email/Slack notification integrations
- **Custom Dashboards** - Drag-and-drop dashboard builder
- **Database Monitoring** - Query performance and database metrics
- **Session Replay** - User interaction recording and playback
- **Mobile Monitoring** - Mobile application performance tracking

---

Built with ❤️ using modern web technologies for comprehensive application performance monitoring.
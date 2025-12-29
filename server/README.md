# Unity Finance Backend - Deployment Guide

## Overview

This is a production-ready Node.js/Express backend for a finance application with enterprise-grade security, auditability, and scalability features.

## Features

✅ **Authentication Hardening**
- Account lockout after 5 failed attempts (configurable)
- Automatic unlock after 30 minutes
- JWT tokens with refresh token rotation
- Secure password hashing with bcrypt

✅ **Audit & Transparency**
- Complete activity log for all user actions
- Session management with device tracking
- "Last active sessions" endpoint
- Remote session revocation

✅ **Data Safety**
- Soft delete for all critical data
- CSV and PDF data export
- Backup-friendly design
- Restoration capabilities

✅ **Performance Protection**
- Edge-cacheable read APIs
- Feature flag system  
- Redis caching layer
- Distributed rate limiting

✅ **Observability**
- Sentry error tracking integration
- Request correlation IDs
- Slow query detection
- Performance monitoring

✅ **Abuse & Cost Control**
- Signup throttling (5/day per IP)
- Per-user API rate limits
- IP-based rate limiting
- Safe anonymous access limits

✅ **Future-Proofing**
- API versioning (/api/v1/*)
- Safe schema migrations
- Feature flags for gradual rollouts

## Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x
- **Redis** >= 6.x (required for production)
- **npm** or **yarn**

## Quick Start (Development)

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

Minimum required variables:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/unity_finance
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-this-to-a-random-string
REFRESH_TOKEN_SECRET=change-this-to-another-random-string
```

### 3. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# OR create a migration (recommended for production)
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Production Deployment

### 1. Environment Setup

**Critical**: All `*_SECRET` variables MUST be changed to cryptographically random values:

```bash
# Generate secrets
openssl rand -base64 64
```

Set these in your hosting platform's environment variables:
- `JWT_SECRET`
- `REFRESH_TOKEN_SECRET`
- `DATABASE_URL` (production PostgreSQL)
- `REDIS_URL` (production Redis)
- `SENTRY_DSN` (error tracking)
- `NODE_ENV=production`
- `FRONTEND_URL` (your production domain)

### 2. Database Migrations

```bash
# Run migrations (safe, version-controlled schema changes)
npm run prisma:migrate:deploy
```

### 3. Build Application

```bash
npm run build
```

### 4. Start Production Server

```bash
npm start
```

## Horizontal Scaling

This backend is designed to scale horizontally:

### Requirements for Multi-Instance Deployment

1. **Shared Redis**: All instances MUST connect to the same Redis
   - Session storage (any instance can validate any session)
   - Rate limiting (prevents bypass by hitting different servers)
   - Feature flag caching

2. **Shared Database**: All instances connect to the same PostgreSQL
   - Connection pooling configured per instance
   - Formula: `(instances * pool_size) < max_db_connections`

3. **Stateless Design**: No in-memory state
   - All session data in Redis/Database
   - JWT tokens validated independently

### Example: 3-Instance Setup

```
Load Balancer (nginx, AWS ALB, etc.)
├── Server Instance 1 → Redis + PostgreSQL
├── Server Instance 2 → Redis + PostgreSQL
└── Server Instance 3 → Redis + PostgreSQL
```

Configuration per instance:
```env
# Limit connections per instance
DATABASE_URL=postgresql://user:pass@db:5432/finance?connection_limit=10
# With 3 instances: 3 * 10 = 30 total connections (keep under DB limit)
```

## API Versioning

All APIs are versioned for stability:

- **v1**: `/api/v1/*` - Current stable version
- Legacy unversioned endpoints still work but are deprecated

Example endpoints:
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/sessions
GET    /api/v1/transactions
GET    /api/v1/export/csv
```

## Security Best Practices

### 1. Secrets Management
- Never commit `.env` to version control
- Use platform environment variables (Vercel, Heroku, AWS Secrets Manager)
- Rotate secrets periodically

### 2. Database Security
- Use connection pooling
- Enable SSL connections in production
- Set up automated backups
- Test point-in-time recovery

### 3. Redis Security
- Enable authentication (`requirepass`)
-Configure persistence (RDB + AOF)
- Set up backups/replication

### 4. Rate Limiting
- Adjust limits based on your traffic patterns
- Monitor for abuse (check logs)
- Use feature flags to disable heavy endpoints during attacks

### 5. Monitoring
- Set up Sentry for error tracking
- Monitor slow query logs
- Set up alerts for error spikes
- Track API response times

## Database Migrations

### Creating a Migration

```bash
# After changing schema.prisma
npm run prisma:migrate -- --name add_new_feature
```

### Applying Migrations

```bash
# Development
npm run prisma:migrate

# Production
npm run prisma:migrate:deploy
```

### Migration Strategy

1. **Never drop columns immediately** - Soft deprecate first
2. **Add columns as nullable** - Then backfill data
3. **Test migrations on staging** - Before production
4. **Have rollback plan** - Save DB snapshot before big changes

## Feature Flags

### Toggling Features at Runtime

```bash
# Via environment variable (immediate, no deploy)
FEATURE_DATA_EXPORT=false

# Via database (admin API)
PATCH /api/v1/admin/flags/data-export
{ "isEnabled": false }
```

### Use Cases
- Disable expensive features during traffic spikes
- Gradual rollout (0-100% of users)
- A/B testing
- Emergency killswitch

## Troubleshooting

### Database Connection Issues

```
Error: too many connections
```

**Solution**: Reduce connection pool size
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=5
```

### Redis Connection Failed

```
Warning: Redis connection failed
```

**Development**: App continues (in-memory fallbacks)
**Production**: Fix Redis immediately (critical for sessions/rate limiting)

### Slow Queries

Check logs for queries >1000ms:
```
logger.warn('Slow query detected', { query: '...', duration: '1523ms' })
```

**Solution**: Add database indexes, review query optimization

### Account Lockout Issues

User locked out unexpectedly:
```bash
# Check lock status
SELECT id, email, lockedUntil, failedLoginAttempts FROM "User" WHERE email = 'user@example.com';

# Manually unlock (admin only)
UPDATE "User" SET lockedUntil = NULL, failedLoginAttempts = 0 WHERE email = 'user@example.com';
```

## Monitoring Checklist

- [ ] Sentry configured and receiving errors
- [ ] Database backup automated (daily minimum)
- [ ] Redis persistence enabled(RDB snapshots)
- [ ] Uptime monitoring (Pingdom, UptimeRobot)
- [ ] Log aggregation (Datadog, Loggly)
- [ ] Alert on error rate spikes
- [ ] Monitor API response times
- [ ] Track database connection pool usage
- [ ] Monitor Redis memory usage

## Support & Maintenance

### Regular Tasks

**Daily**:
- Review error logs in Sentry
- Check slow query logs

**Weekly**:
- Review feature flag usage
- Check rate limit violations
- Monitor database growth

**Monthly**:
- Update dependencies
- Review security advisories
- Load testing
- Backup restoration test

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "UP",
  "timestamp": "2025-12-29T16:00:00.000Z",
  "uptime": 12345,
  "dependencies": {
    "database": "connected",
    "redis": "connected"
  }
}
```

## Performance Tuning

### Database Optimization
1. Add indexes for frequently queried fields
2. Use `EXPLAIN ANALYZE` for slow queries
3. Configure connection pooling
4. Enable query result caching

### Redis Optimization
1. Set appropriate TTLs for cached data
2. Monitor memory usage
3. Use Redis pipelining for bulk operations
4. Configure eviction policy

### Application Optimization
1. Enable compression (gzip)
2. Use caching middleware for read APIs
3. Implement pagination for large datasets
4. Stream large exports (don't load all in memory)

## License

[Your License Here]

## Contact

[Your Contact Information]

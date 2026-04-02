import promClient from 'prom-client';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import Sentry from '@sentry/node';

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const activeBookings = new promClient.Gauge({
  name: 'active_bookings',
  help: 'Number of active bookings'
});

export const revenueTotal = new promClient.Gauge({
  name: 'revenue_total',
  help: 'Total revenue'
});

register.registerMetric(httpRequestDuration);
register.registerMetric(activeBookings);
register.registerMetric(revenueTotal);

// Winston logging
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '30d'
    }),
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d'
    })
  ]
});

// Sentry error tracking
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: expressApp })
  ]
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode).observe(duration);
    
    logger.info(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
};

// Health check endpoint
export const healthCheck = async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    uptime: process.uptime()
  };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    logger.error('Database health check failed:', error);
  }
  
  try {
    await redis.ping();
    checks.redis = true;
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }
  
  const isHealthy = checks.database && checks.redis;
  const statusCode = isHealthy ? 200 : 503;
  
  res.status(statusCode).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
};
import morgan from 'morgan';

// Custom token to mask request bodies in production
morgan.token('masked-body', (req) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, only log metadata - never the actual text content
    if (req.body && req.body.text) {
      const length = Buffer.byteLength(req.body.text, 'utf8');
      return `[text body: ${length} bytes masked]`;
    }
    return '[no body]';
  }
  // In development, log normally (dev morgan format will handle this)
  return '';
});

// Production format: log only metadata, never sensitive content
const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms :masked-body';

// Development format: use default morgan 'dev' format
const developmentFormat = 'dev';

export const logger = morgan(
  process.env.NODE_ENV === 'production' ? productionFormat : developmentFormat
);

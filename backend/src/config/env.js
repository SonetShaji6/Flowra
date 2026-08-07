const dotenv = require('dotenv');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

// Load `.env` first (deployment default), then the environment-specific file.
// `dotenv` never overwrites variables that are already set, so real process
// environment variables (Render, Vercel, CI) always win over committed files.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, `../../.env.${NODE_ENV}`) });

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

// A `mongodb+srv://host` URI with no path selects the `test` database silently.
// Append the intended database name when the URI omits it.
const withDatabaseName = (uri, dbName) => {
  if (!uri) return uri;
  const [base, query] = uri.split('?');
  const withoutTrailingSlash = base.replace(/\/+$/, '');
  const schemeSeparator = withoutTrailingSlash.indexOf('://');
  const afterScheme = withoutTrailingSlash.slice(schemeSeparator + 3);
  const hasDatabase = afterScheme.includes('/');

  const resolved = hasDatabase ? withoutTrailingSlash : `${withoutTrailingSlash}/${dbName}`;
  return query ? `${resolved}?${query}` : resolved;
};

const DB_NAME = process.env.MONGODB_DB_NAME || 'flowra';

const config = {
  PORT: toNumber(process.env.PORT, 5001),
  NODE_ENV,
  IS_PRODUCTION: NODE_ENV === 'production',
  IS_TEST: NODE_ENV === 'test',
  DB_NAME,
  MONGODB_URI: withDatabaseName(
    process.env.MONGODB_URI || 'mongodb://localhost:27017',
    DB_NAME
  ),
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || process.env.JWT_EXPIRE || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  // Extra origins for preview deployments, e.g. "https://flowra.vercel.app,https://staging.flowra.app"
  CORS_ORIGINS: toList(process.env.CORS_ORIGINS, []),
  RATE_LIMIT: {
    // Generous global ceiling: the tight default made Postman/newman runs fail.
    WINDOW_MS: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    MAX: toNumber(process.env.RATE_LIMIT_MAX, 1000),
    AUTH_MAX: toNumber(process.env.RATE_LIMIT_AUTH_MAX, 30),
    AI_MAX: toNumber(process.env.RATE_LIMIT_AI_MAX, 20),
  },
  PAGINATION: {
    DEFAULT_LIMIT: toNumber(process.env.PAGINATION_DEFAULT_LIMIT, 20),
    MAX_LIMIT: toNumber(process.env.PAGINATION_MAX_LIMIT, 100),
  },
  AI: {
    PROVIDER: process.env.AI_PROVIDER || 'gemini',
    API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY,
    MODEL: process.env.AI_MODEL || (process.env.AI_PROVIDER === 'openai' ? 'gpt-4o-mini' : 'gemini-3.6-flash'),
    BASE_URL: process.env.AI_BASE_URL || undefined,
    PROJECT_NAME: process.env.GEMINI_PROJECT_NAME || undefined,
    PROJECT_NUMBER: process.env.GEMINI_PROJECT_NUMBER || undefined,
    // Cost/abuse controls — see docs/security-plan.md
    MAX_INPUT_CHARS: toNumber(process.env.AI_MAX_INPUT_CHARS, 4000),
    MAX_OUTPUT_TOKENS: toNumber(process.env.AI_MAX_OUTPUT_TOKENS, 1200),
    MAX_SUGGESTIONS: toNumber(process.env.AI_MAX_SUGGESTIONS, 12),
    MAX_CONTEXT_TASKS: toNumber(process.env.AI_MAX_CONTEXT_TASKS, 40),
    MAX_CONTEXT_ACTIVITIES: toNumber(process.env.AI_MAX_CONTEXT_ACTIVITIES, 15),
    TIMEOUT_MS: toNumber(process.env.AI_TIMEOUT_MS, 30000),
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'rf2hvdrj',
    API_KEY: process.env.CLOUDINARY_API_KEY || '855845975675466',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || 'TMMXA8g2JJG1PZPoWrp1JTD-dhY',
  },
};

// A placeholder key means "no provider configured" — the AI service then falls
// back to its deterministic heuristic engine instead of failing requests.
config.AI.ENABLED = Boolean(
  config.AI.API_KEY && !/^(sk-)?placeholder$/i.test(config.AI.API_KEY.trim())
);

if (config.IS_PRODUCTION && config.JWT_SECRET === 'development-secret-change-me') {
  throw new Error('JWT_SECRET must be set to a strong value in production');
}

module.exports = config;

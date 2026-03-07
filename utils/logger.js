const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const colorMap = {
    INFO: colors.green,
    WARN: colors.yellow,
    ERROR: colors.red,
    DEBUG: colors.blue,
    SUCCESS: colors.cyan
  };
  
  const color = colorMap[level] || colors.reset;
  const logMessage = `${color}[${level}]${colors.reset} ${colors.bright}${timestamp}${colors.reset} - ${message}`;
  
  console.log(logMessage);
  
  if (data) {
    console.log(`${colors.blue}Data:${colors.reset}`, JSON.stringify(data, null, 2));
  }
};

const logger = {
  info: (message, data) => log('INFO', message, data),
  warn: (message, data) => log('WARN', message, data),
  error: (message, data) => log('ERROR', message, data),
  debug: (message, data) => log('DEBUG', message, data),
  success: (message, data) => log('SUCCESS', message, data)
};

module.exports = logger;

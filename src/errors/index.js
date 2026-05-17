class AppError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field, details = {}) {
    super(message, 'VALIDATION_ERROR', { field, ...details });
  }
}

class FileError extends AppError {
  constructor(message, filePath, details = {}) {
    super(message, 'FILE_ERROR', { filePath, ...details });
  }
}

class SecurityError extends AppError {
  constructor(message, details = {}) {
    super(message, 'SECURITY_ERROR', details);
  }
}

class ConfigError extends AppError {
  constructor(message, details = {}) {
    super(message, 'CONFIG_ERROR', details);
  }
}

const errorCodes = {
  VALIDATION_ERROR: 400,
  FILE_ERROR: 500,
  SECURITY_ERROR: 403,
  CONFIG_ERROR: 500,
  UNKNOWN_ERROR: 500
};

function getHttpStatusCode(error) {
  if (error instanceof AppError) {
    return errorCodes[error.code] || 500;
  }
  return 500;
}

function formatError(error) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: error.timestamp
      }
    };
  }
  
  return {
    success: false,
    error: {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: {},
      timestamp: new Date().toISOString()
    }
  };
}

function logError(error, context = '') {
  const formatted = formatError(error);
  
  console.error('=== Application Error ===');
  console.error(`Timestamp: ${formatted.error.timestamp}`);
  console.error(`Code: ${formatted.error.code}`);
  console.error(`Context: ${context}`);
  console.error(`Message: ${formatted.error.message}`);
  
  if (Object.keys(formatted.error.details).length > 0) {
    console.error('Details:', JSON.stringify(formatted.error.details, null, 2));
  }
  
  if (error.stack) {
    console.error('Stack Trace:', error.stack);
  }
  
  console.error('========================');
}

function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    logError(error, 'Uncaught Exception');
    
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  });

  process.on('unhandledRejection', (reason, promise) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logError(error, 'Unhandled Rejection');
  });
}

module.exports = {
  AppError,
  ValidationError,
  FileError,
  SecurityError,
  ConfigError,
  errorCodes,
  getHttpStatusCode,
  formatError,
  logError,
  setupGlobalErrorHandlers
};
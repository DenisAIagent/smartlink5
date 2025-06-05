import { sanitizeData } from './security';

const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.logHistory = [];
    this.maxHistorySize = 100;
  }

  formatMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const sanitizedData = data ? sanitizeData(data) : null;
    
    return {
      timestamp,
      level,
      message,
      data: sanitizedData
    };
  }

  addToHistory(logEntry) {
    this.logHistory.push(logEntry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  debug(message, data = null) {
    const logEntry = this.formatMessage(LOG_LEVELS.DEBUG, message, data);
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data);
    }
    this.addToHistory(logEntry);
  }

  info(message, data = null) {
    const logEntry = this.formatMessage(LOG_LEVELS.INFO, message, data);
    console.info(`[INFO] ${message}`, data);
    this.addToHistory(logEntry);
  }

  warn(message, data = null) {
    const logEntry = this.formatMessage(LOG_LEVELS.WARN, message, data);
    console.warn(`[WARN] ${message}`, data);
    this.addToHistory(logEntry);
  }

  error(message, error = null, data = null) {
    const errorData = error ? {
      message: error.message,
      stack: error.stack,
      ...data
    } : data;

    const logEntry = this.formatMessage(LOG_LEVELS.ERROR, message, errorData);
    console.error(`[ERROR] ${message}`, errorData);
    this.addToHistory(logEntry);

    // En production, envoyer l'erreur à un service de monitoring
    if (!this.isDevelopment) {
      this.sendToMonitoring(logEntry);
    }
  }

  async sendToMonitoring(logEntry) {
    try {
      // Implémenter l'envoi vers un service de monitoring (ex: Sentry, LogRocket)
      // await monitoringService.send(logEntry);
    } catch (error) {
      console.error('Erreur lors de l\'envoi au monitoring:', error);
    }
  }

  getHistory() {
    return [...this.logHistory];
  }

  clearHistory() {
    this.logHistory = [];
  }
}

export const logger = new Logger();
export default logger; 
/**
 * Logger utility for consistent logging across the application
 * In production, this could be connected to a service like Sentry or LogRocket
 */

class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === "production" || false;
    this.appVersion = process.env.VITE_APP_VERSION || "1.0.0";
  }

  formatMessage(level, message, options = {}) {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (options.tags) {
      const tagsStr = Object.entries(options.tags)
        .map(([key, value]) => `${key}=${value}`)
        .join(", ");
      formattedMessage += ` [${tagsStr}]`;
    }

    return formattedMessage;
  }

  debug(message, options = {}) {
    if (!this.isProduction) {
      console.debug(
        this.formatMessage("debug", message, options),
        options.extra || "",
      );
    }
  }

  info(message, options = {}) {
    console.info(
      this.formatMessage("info", message, options),
      options.extra || "",
    );
  }

  warn(message, options = {}) {
    console.warn(
      this.formatMessage("warn", message, options),
      options.extra || "",
    );
  }

  error(message, error, options = {}) {
    console.error(
      this.formatMessage("error", message, options),
      error || "",
      options.extra || "",
    );

    // In production, you would send this to an error reporting service
    if (this.isProduction && error) {
      // Example: errorReportingService.captureException(error, { ...options, message });
    }
  }

  // Track user actions or events
  trackEvent(eventName, properties) {
    if (this.isProduction) {
      // Example: analyticsService.track(eventName, properties);
    } else {
      this.debug(`EVENT: ${eventName}`, { extra: properties });
    }
  }
}

const logger = new Logger();
export default logger;

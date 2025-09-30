// Production-safe logging utility
class Logger {
  static log(level, message, data = null) {
    // Only log in development or when explicitly enabled
    if (process.env.NODE_ENV === "development" || process.env.ENABLE_LOGGING === "true") {
      const timestamp = new Date().toISOString()
      const logEntry = {
        timestamp,
        level,
        message,
        ...(data && { data: this.sanitizeData(data) })
      }
      
      console[level](JSON.stringify(logEntry, null, 2))
    }
  }

  static sanitizeData(data) {
    // Remove sensitive information from log data
    if (typeof data === "object" && data !== null) {
      const sanitized = { ...data }
      
      // Remove sensitive keys
      const sensitiveKeys = [
        "privateKey", "apiKey", "secret", "password", "token", 
        "authorization", "auth", "credential", "signature"
      ]
      
      sensitiveKeys.forEach(key => {
        if (sanitized[key]) {
          sanitized[key] = "[REDACTED]"
        }
      })
      
      return sanitized
    }
    
    return data
  }

  static info(message, data = null) {
    this.log("info", message, data)
  }

  static warn(message, data = null) {
    this.log("warn", message, data)
  }

  static error(message, data = null) {
    this.log("error", message, data)
  }

  static debug(message, data = null) {
    this.log("debug", message, data)
  }
}

export default Logger

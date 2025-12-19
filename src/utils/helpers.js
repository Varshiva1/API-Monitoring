// Format uptime percentage
export const formatUptime = (percentage) => {
    return `${percentage.toFixed(2)}%`;
  };
  
  // Format duration from milliseconds
  export const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };
  
  // Format response time
  export const formatResponseTime = (ms) => {
    if (ms < 1000) {
      return `${ms}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  
  // Generate random string
  export const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  // Sanitize URL for display
  export const sanitizeUrl = (url) => {
    try {
      const urlObj = new URL(url);
      // Remove query params and hash
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (error) {
      return url;
    }
  };
  
  // Parse time string to milliseconds
  export const parseTimeToMs = (timeStr) => {
    const units = {
      ms: 1,
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };
  
    const match = timeStr.match(/^(\d+)(ms|s|m|h|d)$/);
    if (!match) {
      throw new Error('Invalid time format');
    }
  
    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  };
  
  // Get status color
  export const getStatusColor = (status) => {
    const colors = {
      up: 'green',
      down: 'red',
      paused: 'yellow',
      unknown: 'gray',
    };
    return colors[status] || 'gray';
  };
  
  // Calculate average
  export const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  };
  
  // Group by key
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  };
  
  // Chunk array
  export const chunkArray = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };
  
  // Sleep/delay function
  export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  
  // Retry function with exponential backoff
  export const retry = async (fn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await sleep(delay * Math.pow(2, i));
        }
      }
    }
    
    throw lastError;
  };
  
  // Validate URL
  export const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  // Truncate string
  export const truncate = (str, length = 50) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  };
  
  // Get date range
  export const getDateRange = (days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return { startDate, endDate };
  };
  
  // Format date to readable string
  export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Deep clone object
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Remove undefined/null values from object
  export const cleanObject = (obj) => {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {});
  };
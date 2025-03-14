/**
 * Gets the user's date format settings from storage or uses the default
 * @returns {Promise<Object>} Settings object with dateFormat property
 */
export function getDateSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      dateFormat: 'default',
      timestampFormat: 'seconds',
      useUtcTime: false
    }, (settings) => {
      resolve(settings);
    });
  });
}

// Cache for settings to reduce storage reads
let cachedSettings = null;

/**
 * Gets settings with caching to reduce storage reads
 * @returns {Promise<Object>} Settings object
 */
export async function getCachedSettings() {
  if (!cachedSettings) {
    cachedSettings = await getDateSettings();
    
    // Listen for storage changes to update cache
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      
      if (changes.dateFormat || changes.timestampFormat || changes.useUtcTime) {
        // Update cached settings
        if (changes.dateFormat) {
          cachedSettings.dateFormat = changes.dateFormat.newValue;
        }
        if (changes.timestampFormat) {
          cachedSettings.timestampFormat = changes.timestampFormat.newValue;
        }
        if (changes.useUtcTime) {
          cachedSettings.useUtcTime = changes.useUtcTime.newValue;
        }
      }
    });
    
    // Listen for custom settings changed event for immediate updates
    document.addEventListener('settingsChanged', (event) => {
      if (event.detail) {
        if (event.detail.dateFormat) {
          cachedSettings.dateFormat = event.detail.dateFormat;
        }
        if (event.detail.timestampFormat) {
          cachedSettings.timestampFormat = event.detail.timestampFormat;
        }
        if (event.detail.useUtcTime !== undefined) {
          cachedSettings.useUtcTime = event.detail.useUtcTime;
        }
      }
    });
  }
  
  return cachedSettings;
}

/**
 * Formats a date based on the user's settings
 * @param {Date} date - The date to format
 * @param {boolean} isUTC - Whether to use UTC time
 * @param {string} format - Optional format override (default, iso, short, long)
 * @returns {string} The formatted date string
 */
export async function formatDateTime(date, isUTC = false, format = null) {
  // Get user's date format setting if not provided
  if (!format) {
    const settings = await getCachedSettings();
    format = settings.dateFormat;
  }
  
  // Format based on the selected format
  switch (format) {
    case 'iso':
      if (isUTC) {
        return date.toISOString();
      } else {
        const pad = (num) => String(num).padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

        // Get timezone offset in format +/-HH:MM
        const tzOffset = date.getTimezoneOffset();
        const tzSign = tzOffset <= 0 ? '+' : '-';
        const tzHours = pad(Math.abs(Math.floor(tzOffset / 60)));
        const tzMinutes = pad(Math.abs(tzOffset % 60));
        
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${tzSign}${tzHours}:${tzMinutes}`;
      }
    
    case 'short':
      return date.toLocaleString('en-US', {
        timeZone: isUTC ? 'UTC' : undefined,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: undefined // Remove timezone name
      });
    
    case 'long':
      return date.toLocaleString('en-US', {
        timeZone: isUTC ? 'UTC' : undefined,
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: undefined // Remove timezone name
      });
    
    default: // Default format
      return date.toLocaleString('en-US', {
        timeZone: isUTC ? 'UTC' : undefined,
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: undefined // Remove timezone name
      });
  }
}

/**
 * Gets the timezone name for the current location in GMT format
 * @returns {string} The timezone name in GMT format (e.g., GMT-3)
 */
export function getTimezoneName() {
  // Get the timezone offset in minutes
  const offset = new Date().getTimezoneOffset();
  
  // Convert to hours and format as GMT+X or GMT-X
  const hours = Math.abs(Math.floor(offset / 60));
  const minutes = Math.abs(offset % 60);
  
  // Note: The sign is inverted because getTimezoneOffset() returns the opposite of what we want
  // getTimezoneOffset() returns positive for timezones west of UTC and negative for east
  const sign = offset <= 0 ? '+' : '-';
  
  if (minutes === 0) {
    return `GMT${sign}${hours}`;
  } else {
    return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

export function getCurrentDateTime(isUTC) {
  const now = new Date();
  
  if (isUTC) {
    // Simply format the UTC time directly from the Date object
    return `${now.getUTCFullYear()}-${
      String(now.getUTCMonth() + 1).padStart(2, '0')}-${
      String(now.getUTCDate()).padStart(2, '0')}T${
      String(now.getUTCHours()).padStart(2, '0')}:${
      String(now.getUTCMinutes()).padStart(2, '0')}`;
  } else {
    // For local time, we can use the existing approach
    const tzOffset = now.getTimezoneOffset() * 60000;
    return (new Date(now - tzOffset)).toISOString().slice(0, 16);
  }
}

export function convertDateTime(datetime, toUTC) {
  if (!datetime) return '';
  
  if (toUTC) {
    const date = new Date(datetime);
    const utcYear = date.getUTCFullYear();
    const utcMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(date.getUTCDate()).padStart(2, '0');
    const utcHours = String(date.getUTCHours()).padStart(2, '0');
    const utcMinutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${utcYear}-${utcMonth}-${utcDay}T${utcHours}:${utcMinutes}`;
  } else {
    if (datetime instanceof Date) {
      datetime = datetime.toISOString().slice(0, 16);
    }
    
    try {
      const [datePart, timePart] = datetime.toString().split('T');
      if (!datePart || !timePart) {
        console.error('Invalid datetime format');
        return '';
      }
      
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      
      const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
      
      const localYear = utcDate.getFullYear();
      const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
      const localDay = String(utcDate.getDate()).padStart(2, '0');
      const localHours = String(utcDate.getHours()).padStart(2, '0');
      const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');
      
      return `${localYear}-${localMonth}-${localDay}T${localHours}:${localMinutes}`;
    } catch (error) {
      console.error('Error converting datetime:', error);
      return '';
    }
  }
}

/**
 * Formats the time difference between a timestamp and the current time
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Human-readable time difference (e.g., "2 hours ago", "in 5 days")
 */
export function formatTimeDifference(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const diffSeconds = timestamp - now;
  const isInFuture = diffSeconds > 0;
  const absDiff = Math.abs(diffSeconds);
  
  // Time units in seconds
  const MINUTE = 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;
  const WEEK = DAY * 7;
  const MONTH = DAY * 30; // Approximate
  const YEAR = DAY * 365; // Approximate
  
  let result = '';
  
  if (absDiff < MINUTE) {
    // Less than a minute
    result = 'just now';
  } else if (absDiff < HOUR) {
    // Less than an hour
    const minutes = Math.floor(absDiff / MINUTE);
    result = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  } else if (absDiff < DAY) {
    // Less than a day
    const hours = Math.floor(absDiff / HOUR);
    const remainingMinutes = Math.floor((absDiff % HOUR) / MINUTE);
    
    if (remainingMinutes === 0) {
      result = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      result = `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    }
  } else if (absDiff < WEEK) {
    // Less than a week
    const days = Math.floor(absDiff / DAY);
    const remainingHours = Math.floor((absDiff % DAY) / HOUR);
    
    if (remainingHours === 0) {
      result = `${days} ${days === 1 ? 'day' : 'days'}`;
    } else {
      result = `${days} ${days === 1 ? 'day' : 'days'} ${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`;
    }
  } else if (absDiff < MONTH) {
    // Less than a month
    const weeks = Math.floor(absDiff / WEEK);
    const remainingDays = Math.floor((absDiff % WEEK) / DAY);
    
    if (remainingDays === 0) {
      result = `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else {
      result = `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    }
  } else if (absDiff < YEAR) {
    // Less than a year
    const months = Math.floor(absDiff / MONTH);
    const remainingDays = Math.floor((absDiff % MONTH) / DAY);
    
    if (remainingDays === 0) {
      result = `${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      result = `${months} ${months === 1 ? 'month' : 'months'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    }
  } else {
    // More than a year
    const years = Math.floor(absDiff / YEAR);
    const remainingMonths = Math.floor((absDiff % YEAR) / MONTH);
    
    if (remainingMonths === 0) {
      result = `${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      result = `${years} ${years === 1 ? 'year' : 'years'} ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    }
  }
  
  // Add prefix/suffix based on whether the time is in the future or past
  if (result === 'just now') {
    return result;
  } else if (isInFuture) {
    return `in ${result}`;
  } else {
    return `${result} ago`;
  }
} 
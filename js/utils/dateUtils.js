export function formatDateTime(date, isUTC = false) {
  return date.toLocaleString('en-US', {
    timeZone: isUTC ? 'UTC' : undefined,
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: isUTC ? 'short' : 'longOffset'
  });
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
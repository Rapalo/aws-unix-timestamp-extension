import { getFlagImg } from './flagUtils.js';

export function getTimezoneMap() {
  return {
    // Africa
    'Africa/Abidjan': 'CI',
    'Africa/Accra': 'GH',
    'Africa/Cairo': 'EG',
    'Africa/Casablanca': 'MA',
    'Africa/Johannesburg': 'ZA',
    'Africa/Lagos': 'NG',
    'Africa/Nairobi': 'KE',
    
    // Americas
    'America/Anchorage': 'US',
    'America/Argentina/Buenos_Aires': 'AR',
    'America/Bogota': 'CO',
    'America/Caracas': 'VE',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'America/Halifax': 'CA',
    'America/Los_Angeles': 'US',
    'America/Mexico_City': 'MX',
    'America/New_York': 'US',
    'America/Phoenix': 'US',
    'America/Santiago': 'CL',
    'America/Sao_Paulo': 'BR',
    'America/Toronto': 'CA',
    'America/Vancouver': 'CA',
    
    // Asia
    'Asia/Bangkok': 'TH',
    'Asia/Dubai': 'AE',
    'Asia/Hong_Kong': 'HK',
    'Asia/Jakarta': 'ID',
    'Asia/Kolkata': 'IN',
    'Asia/Kuwait': 'KW',
    'Asia/Manila': 'PH',
    'Asia/Seoul': 'KR',
    'Asia/Shanghai': 'CN',
    'Asia/Singapore': 'SG',
    'Asia/Tokyo': 'JP',
    
    // Australia & Pacific
    'Australia/Adelaide': 'AU',
    'Australia/Brisbane': 'AU',
    'Australia/Melbourne': 'AU',
    'Australia/Perth': 'AU',
    'Australia/Sydney': 'AU',
    'Pacific/Auckland': 'NZ',
    'Pacific/Honolulu': 'US',
    
    // Europe
    'Europe/Amsterdam': 'NL',
    'Europe/Berlin': 'DE',
    'Europe/Brussels': 'BE',
    'Europe/Dublin': 'IE',
    'Europe/Istanbul': 'TR',
    'Europe/Lisbon': 'PT',
    'Europe/London': 'GB',
    'Europe/Madrid': 'ES',
    'Europe/Moscow': 'RU',
    'Europe/Paris': 'FR',
    'Europe/Rome': 'IT',
    'Europe/Stockholm': 'SE',
    'Europe/Zurich': 'CH'
  };
}

export function getLocaleFlag() {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const timezoneMap = getTimezoneMap();
    
    let countryCode = timezoneMap[timeZone];
    
    if (!countryCode) {
      const languages = navigator.languages || [navigator.language || 'en-US'];
      const localeWithCountry = languages.find(lang => lang.includes('-')) || 'en-US';
      countryCode = localeWithCountry.split('-')[1];
    }

    return getFlagImg(countryCode);
  } catch (error) {
    console.error('Error getting locale flag:', error);
    return '🏳️'; // fallback flag
  }
} 
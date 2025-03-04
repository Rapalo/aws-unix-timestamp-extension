// Inline the flag utils functionality
const FLAG_BASE_URL = 'http://purecatamphetamine.github.io/country-flag-icons/3x2/';

function getFlagUrl(countryCode) {
  return `${FLAG_BASE_URL}${countryCode.toUpperCase()}.svg`;
}

function getFlagImg(countryCode) {
  return `<img 
    src="${getFlagUrl(countryCode)}" 
    alt="${countryCode} flag" 
    style="width: 16px; height: 12px; vertical-align: middle; margin-right: 4px;"
  />`;
}

function getTimezoneMap() {
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

function getLocaleFlag() {
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

function convertTimestampToDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const flagHtml = getLocaleFlag();
  
  const utcDate = date.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'short'
  });

  const localDate = date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'longOffset'
  });

  return `<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local</strong>\n${localDate}`;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add custom tooltip styles to the document
const style = document.createElement('style');
style.textContent = `
  .timestamp-tooltip {
    position: fixed;
    background: #232f3e;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 13px;
    white-space: pre-line;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.1s;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    width: 300px;
  }
  .timestamp-tooltip.visible {
    opacity: 1;
  }
`;
document.head.appendChild(style);

// Create tooltip element
const tooltip = document.createElement('div');
tooltip.className = 'timestamp-tooltip';
document.body.appendChild(tooltip);

function showTooltip(element, content) {
  const rect = element.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  tooltip.innerHTML = content;
  
  // Make tooltip temporarily visible to get its dimensions
  tooltip.style.visibility = 'hidden';
  tooltip.classList.add('visible');
  
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // Horizontal positioning
  if (rect.left + tooltipRect.width + 10 > windowWidth) {
    // Not enough space on the right, try positioning to the left
    if (rect.left - tooltipRect.width - 10 > 0) {
      // Enough space on the left
      tooltip.style.left = `${rect.left - tooltipRect.width - 10}px`;
    } else {
      // Not enough space on either side, center it horizontally
      tooltip.style.left = '10px';
      tooltip.style.width = `${windowWidth - 20}px`;
    }
  } else {
    // Default positioning to the right
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.width = '300px';  // Reset width to default
  }
  
  // Vertical positioning
  if (rect.bottom + tooltipRect.height + 5 > windowHeight) {
    // Not enough space below, position above
    tooltip.style.top = `${rect.top - tooltipRect.height - 5}px`;
  } else {
    // Default positioning below
    tooltip.style.top = `${rect.bottom + 5}px`;
  }
  
  // Make tooltip visible again
  tooltip.style.visibility = 'visible';
}

function hideTooltip() {
  tooltip.classList.remove('visible');
}

function enhanceDynamoDBTable() {
  const elements = document.querySelectorAll('td:not([data-timestamp-processed])');
  
  elements.forEach(element => {
    const text = element.textContent.trim();
    if (/^\d{10}$/.test(text) || /^\d{13}$/.test(text)) {
      const timestamp = /^\d{13}$/.test(text) ? Math.floor(parseInt(text) / 1000) : parseInt(text);
      const date = convertTimestampToDate(timestamp);
      
      element.setAttribute('data-timestamp-processed', 'true');
      element.setAttribute('data-timestamp-content', date);
      element.style.textDecoration = 'underline dotted';
      element.style.cursor = 'help';

      // Add mouse events for custom tooltip
      element.addEventListener('mouseenter', () => {
        showTooltip(element, element.getAttribute('data-timestamp-content'));
      });
      
      element.addEventListener('mouseleave', hideTooltip);
    }
  });
}

// Run the enhancement when the page loads
enhanceDynamoDBTable();

// Create a MutationObserver with debouncing
const debouncedEnhance = debounce(enhanceDynamoDBTable, 50);

const observer = new MutationObserver(debouncedEnhance);

// Observe only the main content area if possible
const targetNode = document.querySelector('#console-main-content') || document.body;
observer.observe(targetNode, { childList: true, subtree: true }); 
import { formatDateTime, getTimezoneName, formatTimeDifference } from './js/utils/dateUtils.js';

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

// User settings with defaults
let userSettings = {
  dateFormat: 'default',
  timestampFormat: 'seconds',
  detectTimestamps: true,
  showTooltipInEditMode: true,
  showTimeDifference: true
};

// Load settings when script initializes
function loadSettings() {
  chrome.storage.sync.get({
    dateFormat: 'default',
    timestampFormat: 'seconds',
    detectTimestamps: true,
    showTooltipInEditMode: true,
    showTimeDifference: true
  }, (settings) => {
    userSettings = settings;
    
    // Only run the enhancement if auto-detection is enabled
    if (userSettings.detectTimestamps) {
      enhanceDynamoDBTable();
      setupMutationObserver();
    } else if (window.timestampObserver) {
      window.timestampObserver.disconnect();
      window.timestampObserver = null;
    }
  });
}

// Listen for settings updates from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    const oldDetectTimestamps = userSettings.detectTimestamps;
    const oldShowTooltipInEditMode = userSettings.showTooltipInEditMode;
    userSettings = message.settings;
    
    // Apply settings changes immediately
    if (userSettings.detectTimestamps) {
      enhanceDynamoDBTable();
      
      // If detection was previously disabled, set up the observer again
      if (!oldDetectTimestamps) {
        setupMutationObserver();
      }
    } else if (oldDetectTimestamps) {
      // Disconnect all observers
      if (window.timestampObserver) {
        window.timestampObserver.disconnect();
        window.timestampObserver = null;
      }
      
      if (window.inputObserver) {
        window.inputObserver.disconnect();
        window.inputObserver = null;
      }
    }
    
    // Handle changes to the showTooltipInEditMode setting
    if (oldShowTooltipInEditMode !== userSettings.showTooltipInEditMode) {
      // Find all processed timestamp elements in edit mode
      const editModeElements = document.querySelectorAll(`
        input[data-timestamp-processed], 
        .awsui-modal-dialog [data-timestamp-processed],
        .awsui-table-editable-cell [data-timestamp-processed],
        .awsui-form-field-control-input-container [data-timestamp-processed]
      `);
      
      editModeElements.forEach(element => {
        // Remove existing event listeners
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        
        // Update cursor style and add event listeners if tooltips are enabled for edit mode
        if (userSettings.showTooltipInEditMode) {
          element.style.cursor = 'help';
          element.addEventListener('mouseenter', handleMouseEnter);
          element.addEventListener('mouseleave', handleMouseLeave);
        } else {
          element.style.cursor = 'text'; // Use text cursor for edit mode when tooltips are disabled
        }
      });
    }
    
    // Send a response to close the message channel properly
    sendResponse({ success: true });
  }
  // Return false to indicate we're not sending an asynchronous response
  return false;
});

// Change to async function and await the formatDateTime calls
async function convertTimestampToDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const flagHtml = getLocaleFlag();
  const timezoneName = getTimezoneName();

  const utcDate = await formatDateTime(date, true, userSettings.dateFormat);
  const localDate = await formatDateTime(date, false, userSettings.dateFormat);
  
  let tooltipContent = `<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local: ${timezoneName}</strong>\n${localDate}`;
  
  // Add time difference if enabled
  if (userSettings.showTimeDifference) {
    const timeDiff = formatTimeDifference(timestamp);
    tooltipContent += `\n\n<strong>⏱️ Time Difference</strong>\n${timeDiff}`;
  }

  return tooltipContent;
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
  
  /* Styles for input fields with timestamps */
  input[data-timestamp-processed], 
  span.awsui-input-value[data-timestamp-processed] {
    text-decoration: underline dotted;
    cursor: help;
  }
  
  /* Ensure tooltip appears above modal dialogs */
  .awsui-modal-dialog {
    z-index: 9999;
  }
`;
document.head.appendChild(style);

// Create tooltip element
const tooltip = document.createElement('div');
tooltip.className = 'timestamp-tooltip';
document.body.appendChild(tooltip);

// Timer for updating time difference
let tooltipUpdateTimer = null;
let currentTooltipTimestamp = null;

// Named event handler functions for tooltip
function handleMouseEnter(event) {
  const element = event.target;
  const timestampContent = element.getAttribute('data-timestamp-content');
  const timestamp = element.getAttribute('data-timestamp-value');
  
  showTooltip(element, timestampContent, timestamp);
}

function handleMouseLeave() {
  hideTooltip();
}

function showTooltip(element, content, timestamp) {
  const rect = element.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  tooltip.innerHTML = content;
  currentTooltipTimestamp = timestamp;
  
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
  
  // Set up timer to update time difference if enabled
  if (userSettings.showTimeDifference && currentTooltipTimestamp) {
    // Clear any existing timer
    if (tooltipUpdateTimer) {
      clearInterval(tooltipUpdateTimer);
    }
    
    // Update time difference every second
    tooltipUpdateTimer = setInterval(() => {
      if (!tooltip.classList.contains('visible')) {
        clearInterval(tooltipUpdateTimer);
        tooltipUpdateTimer = null;
        return;
      }
      
      // Find and update only the time difference part
      const timeDiffRegex = /<strong>⏱️ Time Difference<\/strong>\n(.*?)(?=<\/div>|$)/s;
      const newTimeDiff = formatTimeDifference(parseInt(currentTooltipTimestamp));
      
      const updatedContent = tooltip.innerHTML.replace(
        timeDiffRegex, 
        `<strong>⏱️ Time Difference</strong>\n${newTimeDiff}`
      );
      
      tooltip.innerHTML = updatedContent;
    }, 1000);
  }
}

function hideTooltip() {
  tooltip.classList.remove('visible');
  
  // Clear update timer when tooltip is hidden
  if (tooltipUpdateTimer) {
    clearInterval(tooltipUpdateTimer);
    tooltipUpdateTimer = null;
    currentTooltipTimestamp = null;
  }
}

function enhanceDynamoDBTable() {
  // Process table cells (existing functionality)
  const tableElements = document.querySelectorAll('td:not([data-timestamp-processed])');
  
  tableElements.forEach(element => {
    processTimestampElement(element);
  });
  
  // Process input fields and form elements (new functionality)
  // Target AWS UI components in both view and edit modes
  const editElements = document.querySelectorAll(`
    input:not([data-timestamp-processed]), 
    span.awsui-input-value:not([data-timestamp-processed]),
    .awsui-form-field:not([data-timestamp-processed]),
    .awsui-value-large:not([data-timestamp-processed]),
    .awsui-form-field-control-input-container input:not([data-timestamp-processed]),
    .awsui-table-editable-cell-value:not([data-timestamp-processed])
  `);
  
  editElements.forEach(element => {
    processTimestampElement(element);
  });
  
  // Process modal dialog content
  const modalElements = document.querySelectorAll('.awsui-modal-content [data-dynamodb-field-value]:not([data-timestamp-processed])');
  
  modalElements.forEach(element => {
    processTimestampElement(element);
  });
}

// New helper function to process timestamp elements
function processTimestampElement(element) {
  const text = element.textContent?.trim() || element.value?.trim();
  
  if (!text) return;
  
  // Check for timestamps in the format specified by user settings
  let timestamp = null;
  
  if (/^\d{10}$/.test(text)) {
    // 10-digit (seconds) timestamp
    timestamp = parseInt(text);
  } else if (/^\d{13}$/.test(text)) {
    // 13-digit (milliseconds) timestamp
    timestamp = Math.floor(parseInt(text) / 1000);
  }
  
  if (timestamp !== null) {
    // Check if we're in edit mode
    const isEditMode = element.tagName === 'INPUT' || 
                      element.closest('.awsui-modal-dialog') !== null ||
                      element.closest('.awsui-table-editable-cell') !== null ||
                      element.closest('.awsui-form-field-control-input-container') !== null;
    
    // Await the Promise returned by convertTimestampToDate
    convertTimestampToDate(timestamp).then(date => {
      element.setAttribute('data-timestamp-processed', 'true');
      element.setAttribute('data-timestamp-content', date);
      element.setAttribute('data-timestamp-value', timestamp.toString());
      element.style.textDecoration = 'underline dotted';
      
      // Only set cursor to help if tooltips are enabled for this element
      if (!isEditMode || userSettings.showTooltipInEditMode) {
        element.style.cursor = 'help';
      } else {
        element.style.cursor = 'text'; // Use text cursor for edit mode when tooltips are disabled
      }
      
      // Only add tooltip event listeners if not in edit mode or if tooltips are enabled for edit mode
      if (!isEditMode || userSettings.showTooltipInEditMode) {
        // Add event listeners for tooltip
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
      }
      
      // For input elements, add input event listener to handle changes
      if (element.tagName === 'INPUT') {
        if (!element.hasInputListener) {
          element.addEventListener('input', handleInputChange);
          element.hasInputListener = true;
        }
      }
    });
  }
}

// Handle input changes for timestamp fields
function handleInputChange(event) {
  const element = event.target;
  const newValue = element.value?.trim();
  
  if (!newValue) return;
  
  // Check if the new value is a timestamp
  let timestamp = null;
  
  if (/^\d{10}$/.test(newValue)) {
    timestamp = parseInt(newValue);
  } else if (/^\d{13}$/.test(newValue)) {
    timestamp = Math.floor(parseInt(newValue) / 1000);
  }
  
  if (timestamp !== null) {
    // Update the timestamp content
    convertTimestampToDate(timestamp).then(date => {
      element.setAttribute('data-timestamp-processed', 'true');
      element.setAttribute('data-timestamp-content', date);
      element.setAttribute('data-timestamp-value', timestamp.toString());
      element.style.textDecoration = 'underline dotted';
      
      // Set cursor style based on tooltip setting
      if (userSettings.showTooltipInEditMode) {
        element.style.cursor = 'help';
        
        // Remove existing listeners to avoid duplicates
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        
        // Add event listeners for tooltip
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
      } else {
        element.style.cursor = 'text';
      }
    });
  } else {
    // If no longer a timestamp, remove the processing
    element.removeAttribute('data-timestamp-processed');
    element.removeAttribute('data-timestamp-content');
    element.removeAttribute('data-timestamp-value');
    element.style.textDecoration = '';
    element.style.cursor = '';
    
    // Remove event listeners
    element.removeEventListener('mouseenter', handleMouseEnter);
    element.removeEventListener('mouseleave', handleMouseLeave);
  }
}

// Setup mutation observer to detect DOM changes
function setupMutationObserver() {
  // Disconnect any existing observer
  if (window.timestampObserver) {
    window.timestampObserver.disconnect();
  }
  
  // Create a MutationObserver with debouncing
  const debouncedEnhance = debounce(enhanceDynamoDBTable, 50);
  
  window.timestampObserver = new MutationObserver(debouncedEnhance);
  
  // Observe both the main content area and any modal dialogs
  const targetNodes = [
    document.querySelector('#console-main-content') || document.body,
    ...Array.from(document.querySelectorAll('.awsui-modal-dialog, .awsui-modal-content'))
  ].filter(Boolean);
  
  targetNodes.forEach(node => {
    window.timestampObserver.observe(node, { 
      childList: true, 
      subtree: true 
    });
  });
  
  // Also observe attribute changes for input values
  const inputObserver = new MutationObserver(debouncedEnhance);
  window.inputObserver = inputObserver;
  
  document.querySelectorAll('input, .awsui-input-value').forEach(input => {
    inputObserver.observe(input, {
      attributes: true,
      attributeFilter: ['value']
    });
  });
}

// Initialize the script
loadSettings(); 
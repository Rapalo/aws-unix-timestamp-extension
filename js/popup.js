import { TimestampConverter } from './components/timestampConverter.js';
import { DateConverter } from './components/dateConverter.js';

document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const elements = {
    timestampInput: document.getElementById('timestamp'),
    dateResult: document.getElementById('dateResult'),
    datetimeInput: document.getElementById('datetime'),
    timestampResult: document.getElementById('timestampResult'),
    convertButton: document.getElementById('convertDate'),
    timezoneToggle: document.getElementById('timezoneToggle'),
    helperText: document.querySelector('.helper-text'),
    refreshTimestamp: document.getElementById('refreshTimestamp'),
    refreshDatetime: document.getElementById('refreshDatetime')
  };

  // Validate elements
  if (Object.values(elements).some(el => !el)) {
    console.error('Required DOM elements not found');
    return;
  }

  // Initialize components
  const timestampConverter = new TimestampConverter(
    elements.timestampInput,
    elements.dateResult
  );

  const dateConverter = new DateConverter(
    elements.datetimeInput,
    elements.timestampResult,
    elements.convertButton,
    elements.timezoneToggle,
    elements.helperText
  );

  // Set up event listeners
  elements.refreshTimestamp.addEventListener('click', () => 
    timestampConverter.setCurrentTimestamp());
  
  elements.refreshDatetime.addEventListener('click', () => 
    dateConverter.setCurrentDatetime());
  
  elements.timestampInput.addEventListener('input', () => 
    timestampConverter.convert());
  
  elements.timezoneToggle.addEventListener('change', () => 
    dateConverter.handleTimezoneToggle());
  
  elements.datetimeInput.addEventListener('input', () => 
    dateConverter.updateTimestamp());
  
  elements.convertButton.addEventListener('click', async () => {
    const timestamp = dateConverter.updateTimestamp();
    await navigator.clipboard.writeText(timestamp);
    
    const originalText = elements.convertButton.textContent;
    elements.convertButton.textContent = 'Copied!';
    setTimeout(() => {
      elements.convertButton.textContent = originalText;
    }, 1000);
  });

  // Initialize values
  timestampConverter.setCurrentTimestamp();
  dateConverter.setCurrentDatetime();
}); 
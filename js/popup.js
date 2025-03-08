import { TimestampConverter } from './components/timestampConverter.js';
import { DateConverter } from './components/dateConverter.js';
import { SettingsManager } from './components/settingsManager.js';

document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements for tools
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

  // Get DOM elements for settings
  const settingsElements = {
    dateFormat: document.getElementById('dateFormat'),
    timestampFormat: document.getElementById('timestampFormat'),
    detectTimestampsToggle: document.getElementById('detectTimestampsToggle'),
    showTooltipInEditModeToggle: document.getElementById('showTooltipInEditModeToggle'),
    showTimeDifferenceToggle: document.getElementById('showTimeDifferenceToggle')
  };

  // Get DOM elements for tabs
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Validate elements
  if (Object.values(elements).some(el => !el)) {
    console.error('Required tool DOM elements not found');
    return;
  }

  if (Object.values(settingsElements).some(el => !el)) {
    console.error('Required settings DOM elements not found');
    return;
  }

  // Initialize tab functionality
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      const tabName = tab.getAttribute('data-tab');
      tab.classList.add('active');
      document.getElementById(tabName).classList.add('active');
    });
  });

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

  const settingsManager = new SettingsManager(
    settingsElements.dateFormat,
    settingsElements.timestampFormat,
    settingsElements.detectTimestampsToggle,
    null, // No save button needed
    settingsElements.showTooltipInEditModeToggle,
    settingsElements.showTimeDifferenceToggle
  );

  // Set up event listeners for tools
  elements.refreshTimestamp.addEventListener('click', () => 
    timestampConverter.setCurrentTimestamp());
  
  elements.refreshDatetime.addEventListener('click', () => 
    dateConverter.setCurrentDatetime());
  
  elements.timestampInput.addEventListener('input', () => 
    timestampConverter.convert().catch(err => console.error('Error converting timestamp:', err)));
  
  elements.timezoneToggle.addEventListener('change', () => 
    dateConverter.handleTimezoneToggle());
  
  elements.datetimeInput.addEventListener('input', () => 
    dateConverter.updateTimestamp().catch(err => console.error('Error updating timestamp:', err)));
  
  elements.convertButton.addEventListener('click', async () => {
    const timestamp = await dateConverter.updateTimestamp();
    await navigator.clipboard.writeText(timestamp);
    
    const originalText = elements.convertButton.textContent;
    elements.convertButton.textContent = 'Copied!';
    setTimeout(() => {
      elements.convertButton.textContent = originalText;
    }, 1000);
  });

  // Initialize values
  timestampConverter.setCurrentTimestamp();
  settingsManager.loadSettings();
}); 
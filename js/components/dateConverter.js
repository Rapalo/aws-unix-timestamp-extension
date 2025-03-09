import { formatDateTime, convertDateTime, getCurrentDateTime, getDateSettings, getTimezoneName, formatTimeDifference } from '../utils/dateUtils.js';
import { getLocaleFlag } from '../utils/timezoneUtils.js';

export class DateConverter {
  constructor(datetimeInput, timestampResult, convertButton, timezoneToggle, helperText) {
    this.datetimeInput = datetimeInput;
    this.timestampResult = timestampResult;
    this.convertButton = convertButton;
    this.timezoneToggle = timezoneToggle;
    this.helperText = helperText;
    this.timestampFormat = 'seconds'; // Default format, will be updated by loadSettings
    
    // Load user settings
    this.loadSettings();
    
    // Listen for storage changes to update settings in real-time
    chrome.storage.onChanged.addListener(this.handleSettingsChange.bind(this));
    
    // Listen for custom settings changed event for real-time updates
    document.addEventListener('settingsChanged', this.handleSettingsChangedEvent.bind(this));
  }

  /**
   * Handle custom settings changed event
   * @param {CustomEvent} event - The settings changed event
   */
  handleSettingsChangedEvent(event) {
    if (event.detail) {
      if (event.detail.timestampFormat) {
        this.timestampFormat = event.detail.timestampFormat;
      }
      
      // Update timezone toggle if it changed in settings
      if (event.detail.useUtcTime !== undefined && 
          this.timezoneToggle.checked !== event.detail.useUtcTime) {
        this.timezoneToggle.checked = event.detail.useUtcTime;
        this.updateHelperText();
      }
      
      if (this.datetimeInput.value) {
        // Use Promise handling instead of await since this isn't an async function
        this.updateTimestamp().catch(err => console.error('Error updating timestamp:', err));
      }
    }
  }

  /**
   * Handle changes to settings in storage
   * @param {Object} changes - The changes to storage
   * @param {string} areaName - The area of storage that changed
   */
  handleSettingsChange(changes, areaName) {
    if (areaName !== 'sync') return;
    
    if (changes.timestampFormat) {
      this.timestampFormat = changes.timestampFormat.newValue;
      // Update the displayed timestamp with the new format
      this.updateTimestamp().catch(err => console.error('Error updating timestamp:', err));
    }
    
    // Update timezone toggle if it changed in storage
    if (changes.useUtcTime) {
      // Only update if the value is different to avoid infinite loops
      if (this.timezoneToggle.checked !== changes.useUtcTime.newValue) {
        this.timezoneToggle.checked = changes.useUtcTime.newValue;
        this.updateHelperText();
        this.handleTimezoneToggle();
      }
    }
  }

  async loadSettings() {
    const settings = await getDateSettings();
    this.timestampFormat = settings.timestampFormat;
    
    // Load the UTC time toggle state
    chrome.storage.sync.get({ useUtcTime: false }, (result) => {
      // Set the toggle state
      this.timezoneToggle.checked = result.useUtcTime;
      this.updateHelperText();
      
      // Always set the current datetime with the correct timezone setting
      // This ensures the datetime input is always in the correct timezone format
      this.setCurrentDatetime();
    });
  }

  updateHelperText() {
    this.helperText.textContent = this.timezoneToggle.checked ? 
      'Time is in UTC' : 'Time is in your local timezone';
  }

  async updateTimestamp() {
    const datetime = this.datetimeInput.value;
    if (!datetime) {
      this.timestampResult.innerHTML = '';
      return 0;
    }
    
    let timestamp;
    
    if (this.timezoneToggle.checked) {
      const [datePart, timePart] = datetime.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      timestamp = Math.floor(Date.UTC(year, month - 1, day, hours, minutes) / 1000);
    } else {
      timestamp = Math.floor(new Date(datetime).getTime() / 1000);
    }

    // Convert to milliseconds if that format is selected
    const displayTimestamp = this.timestampFormat === 'milliseconds' ? 
      timestamp * 1000 : timestamp;

    const date = new Date(timestamp * 1000);
    const flagHtml = getLocaleFlag();
    const timezoneName = getTimezoneName();
    
    try {
      const utcDate = await formatDateTime(date, true);
      const localDate = await formatDateTime(date, false);

      // Get settings to check if time difference should be shown
      const settings = await new Promise(resolve => {
        chrome.storage.sync.get({
          showTimeDifferenceInTools: false
        }, resolve);
      });
      
      let resultHtml = `<span class="timestamp-badge">🕓 Unix Timestamp</span>\n${displayTimestamp}\n\n<span class="timestamp-badge">🌍 UTC</span>\n${utcDate}\n\n<span class="timestamp-badge">${flagHtml} Local: ${timezoneName}</span>\n${localDate}`;
      
      // Add time difference if enabled
      if (settings.showTimeDifferenceInTools) {
        const timeDiff = formatTimeDifference(timestamp);
        resultHtml += `\n\n⏱️ ${timeDiff}`;
      }
      
      this.timestampResult.innerHTML = resultHtml;
      this.convertButton.textContent = 'Copy Timestamp';
    } catch (error) {
      console.error('Error updating timestamp:', error);
      this.timestampResult.innerHTML = '<span style="color: red;">Error formatting date</span>';
    }
    
    return displayTimestamp;
  }

  setCurrentDatetime() {
    // Get the current datetime in the correct timezone format
    this.datetimeInput.value = getCurrentDateTime(this.timezoneToggle.checked);
    this.updateTimestamp().catch(err => console.error('Error updating timestamp:', err));
  }

  handleTimezoneToggle() {
    this.updateHelperText();
    
    // Save the toggle state to chrome.storage
    chrome.storage.sync.set({ useUtcTime: this.timezoneToggle.checked });
    
    const currentValue = this.datetimeInput.value;
    if (currentValue) {
      if (this.timezoneToggle.checked) {
        // Convert from local to UTC
        const localDate = new Date(currentValue);
        this.datetimeInput.value = convertDateTime(localDate, true);
      } else {
        // Convert from UTC to local
        const [datePart, timePart] = currentValue.split('T');
        const [year, month, day] = datePart.split('-');
        const [hours, minutes] = timePart.split(':');
        
        const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        
        const localYear = utcDate.getFullYear();
        const localMonth = String(utcDate.getMonth() + 1).padStart(2, '0');
        const localDay = String(utcDate.getDate()).padStart(2, '0');
        const localHours = String(utcDate.getHours()).padStart(2, '0');
        const localMinutes = String(utcDate.getMinutes()).padStart(2, '0');
        
        this.datetimeInput.value = `${localYear}-${localMonth}-${localDay}T${localHours}:${localMinutes}`;
      }
      this.updateTimestamp().catch(err => console.error('Error updating timestamp:', err));
    } else {
      // If no current value, set to current datetime in the correct timezone
      this.setCurrentDatetime();
    }
  }
} 
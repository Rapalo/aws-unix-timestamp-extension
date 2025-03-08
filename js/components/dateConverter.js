import { formatDateTime, convertDateTime, getCurrentDateTime, getDateSettings, getTimezoneName } from '../utils/dateUtils.js';
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
      
      if (this.datetimeInput.value) {
        this.updateTimestamp();
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
      this.updateTimestamp();
    }
  }

  async loadSettings() {
    const settings = await getDateSettings();
    this.timestampFormat = settings.timestampFormat;
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

      this.timestampResult.innerHTML = `<strong>🕓 Unix Timestamp</strong>\n${displayTimestamp}\n\n<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local: ${timezoneName}</strong>\n${localDate}`;
      this.convertButton.textContent = 'Copy Timestamp';
    } catch (error) {
      console.error('Error updating timestamp:', error);
      this.timestampResult.innerHTML = '<span style="color: red;">Error formatting date</span>';
    }
    
    return displayTimestamp;
  }

  setCurrentDatetime() {
    this.datetimeInput.value = getCurrentDateTime(this.timezoneToggle.checked);
    this.updateTimestamp();
  }

  handleTimezoneToggle() {
    this.updateHelperText();
    
    const currentValue = this.datetimeInput.value;
    if (currentValue) {
      if (this.timezoneToggle.checked) {
        const localDate = new Date(currentValue);
        this.datetimeInput.value = convertDateTime(localDate, true);
      } else {
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
      this.updateTimestamp();
    }
  }
} 
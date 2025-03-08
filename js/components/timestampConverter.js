import { formatDateTime, getTimezoneName } from '../utils/dateUtils.js';
import { getLocaleFlag } from '../utils/timezoneUtils.js';

export class TimestampConverter {
  constructor(timestampInput, dateResult) {
    this.timestampInput = timestampInput;
    this.dateResult = dateResult;
    
    // Listen for storage changes to update display in real-time
    chrome.storage.onChanged.addListener(this.handleSettingsChange.bind(this));
    
    // Listen for custom settings changed event for real-time updates
    document.addEventListener('settingsChanged', this.handleSettingsChangedEvent.bind(this));
  }

  /**
   * Handle custom settings changed event
   * @param {CustomEvent} event - The settings changed event
   */
  handleSettingsChangedEvent(event) {
    if (this.timestampInput.value) {
      this.convert().catch(err => console.error('Error converting timestamp:', err));
    }
  }

  /**
   * Handle changes to settings in storage
   * @param {Object} changes - The changes to storage
   * @param {string} areaName - The area of storage that changed
   */
  handleSettingsChange(changes, areaName) {
    if (areaName !== 'sync') return;
    
    if (changes.dateFormat && this.timestampInput.value) {
      // Update the displayed date with the new format
      this.convert().catch(err => console.error('Error converting timestamp:', err));
    }
  }

  async convert() {
    const timestamp = this.timestampInput.value;
    if (!timestamp) {
      this.dateResult.innerHTML = '';
      return;
    }
    
    const date = new Date(timestamp * 1000);
    const flagHtml = getLocaleFlag();
    const timezoneName = getTimezoneName();
    
    try {
      const utcDate = await formatDateTime(date, true);
      const localDate = await formatDateTime(date, false);
      
      this.dateResult.innerHTML = `<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local: ${timezoneName}</strong>\n${localDate}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      this.dateResult.innerHTML = '<span style="color: red;">Error formatting date</span>';
    }
  }

  setCurrentTimestamp() {
    this.timestampInput.value = Math.floor(Date.now() / 1000);
    this.convert().catch(err => console.error('Error converting timestamp:', err));
  }
} 
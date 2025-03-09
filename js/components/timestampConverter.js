import { formatDateTime, getTimezoneName, formatTimeDifference } from '../utils/dateUtils.js';
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
    
    if ((changes.dateFormat || changes.showTimeDifferenceInTools) && this.timestampInput.value) {
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
      
      // Get settings to check if time difference should be shown
      const settings = await new Promise(resolve => {
        chrome.storage.sync.get({
          showTimeDifferenceInTools: false
        }, resolve);
      });
      
      let resultHtml = `<span class="timestamp-badge">🌍 UTC</span>\n${utcDate}\n\n<span class="timestamp-badge">${flagHtml} Local: ${timezoneName}</span>\n${localDate}`;
      
      // Add time difference if enabled
      if (settings.showTimeDifferenceInTools) {
        const timeDiff = formatTimeDifference(parseInt(timestamp));
        resultHtml += `\n\n⏱️ ${timeDiff}`;
      }
      
      this.dateResult.innerHTML = resultHtml;
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
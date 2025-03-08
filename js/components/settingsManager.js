/**
 * Manages user settings for the extension
 */
export class SettingsManager {
  constructor(dateFormatSelect, timestampFormatSelect, detectTimestampsToggle, saveButton, showTooltipInEditModeToggle, showTimeDifferenceToggle) {
    this.dateFormatSelect = dateFormatSelect;
    this.timestampFormatSelect = timestampFormatSelect;
    this.detectTimestampsToggle = detectTimestampsToggle;
    this.showTooltipInEditModeToggle = showTooltipInEditModeToggle;
    this.showTimeDifferenceToggle = showTimeDifferenceToggle;
    
    // Default settings
    this.defaultSettings = {
      dateFormat: 'default',
      timestampFormat: 'seconds',
      detectTimestamps: true,
      showTooltipInEditMode: true,
      showTimeDifference: true,
      useUtcTime: false
    };
    
    // Create a custom event for settings changes
    this.settingsChangedEvent = new CustomEvent('settingsChanged');
    
    // Set up event listeners for auto-saving
    this.setupAutoSave();
  }

  /**
   * Set up event listeners to auto-save settings when changed
   */
  setupAutoSave() {
    this.dateFormatSelect.addEventListener('change', () => this.saveSettings());
    this.timestampFormatSelect.addEventListener('change', () => this.saveSettings());
    this.detectTimestampsToggle.addEventListener('change', () => this.saveSettings());
    if (this.showTooltipInEditModeToggle) {
      this.showTooltipInEditModeToggle.addEventListener('change', () => this.saveSettings());
    }
    if (this.showTimeDifferenceToggle) {
      this.showTimeDifferenceToggle.addEventListener('change', () => this.saveSettings());
    }
  }

  /**
   * Load settings from chrome.storage and populate the UI
   */
  loadSettings() {
    chrome.storage.sync.get(this.defaultSettings, (settings) => {
      this.dateFormatSelect.value = settings.dateFormat;
      this.timestampFormatSelect.value = settings.timestampFormat;
      this.detectTimestampsToggle.checked = settings.detectTimestamps;
      if (this.showTooltipInEditModeToggle) {
        this.showTooltipInEditModeToggle.checked = settings.showTooltipInEditMode;
      }
      if (this.showTimeDifferenceToggle) {
        this.showTimeDifferenceToggle.checked = settings.showTimeDifference;
      }
    });
  }

  /**
   * Save settings to chrome.storage
   */
  saveSettings() {
    // First get the current useUtcTime value to preserve it
    chrome.storage.sync.get({ useUtcTime: false }, (result) => {
      const settings = {
        dateFormat: this.dateFormatSelect.value,
        timestampFormat: this.timestampFormatSelect.value,
        detectTimestamps: this.detectTimestampsToggle.checked,
        showTooltipInEditMode: this.showTooltipInEditModeToggle ? this.showTooltipInEditModeToggle.checked : true,
        showTimeDifference: this.showTimeDifferenceToggle ? this.showTimeDifferenceToggle.checked : true,
        useUtcTime: result.useUtcTime // Preserve the UTC Time toggle state
      };
      
      chrome.storage.sync.set(settings, () => {
        // Broadcast settings change to content scripts
        this.broadcastSettingsChange(settings);
        
        // Dispatch custom event for real-time updates in the popup
        document.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
      });
    });
  }

  /**
   * Send message to all tabs to update settings
   * @param {Object} settings - The new settings
   */
  broadcastSettingsChange(settings) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        try {
          // Only send messages to AWS console tabs and check if tab is still available
          if (tab.url && tab.url.includes('console.aws.amazon.com')) {
            // Use a non-returning sendMessage to avoid the "message channel closed" error
            chrome.tabs.sendMessage(tab.id, {
              action: 'settingsUpdated',
              settings: settings
            }, () => {
              // Ignore any response or error
              const lastError = chrome.runtime.lastError;
              // We're just suppressing the error by checking lastError
            });
          }
        } catch (error) {
          // Silently catch any errors that might occur during message sending
          console.log('Error sending message to tab:', error);
        }
      });
    });
  }
} 
/**
 * Manages user settings for the extension
 */
export class SettingsManager {
  constructor(dateFormatSelect, timestampFormatSelect, detectTimestampsToggle, saveButton) {
    this.dateFormatSelect = dateFormatSelect;
    this.timestampFormatSelect = timestampFormatSelect;
    this.detectTimestampsToggle = detectTimestampsToggle;
    
    // Default settings
    this.defaultSettings = {
      dateFormat: 'default',
      timestampFormat: 'seconds',
      detectTimestamps: true
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
  }

  /**
   * Load settings from chrome.storage and populate the UI
   */
  loadSettings() {
    chrome.storage.sync.get(this.defaultSettings, (settings) => {
      this.dateFormatSelect.value = settings.dateFormat;
      this.timestampFormatSelect.value = settings.timestampFormat;
      this.detectTimestampsToggle.checked = settings.detectTimestamps;
    });
  }

  /**
   * Save settings to chrome.storage
   */
  saveSettings() {
    const settings = {
      dateFormat: this.dateFormatSelect.value,
      timestampFormat: this.timestampFormatSelect.value,
      detectTimestamps: this.detectTimestampsToggle.checked
    };
    
    chrome.storage.sync.set(settings, () => {
      // Broadcast settings change to content scripts
      this.broadcastSettingsChange(settings);
      
      // Dispatch custom event for real-time updates in the popup
      document.dispatchEvent(new CustomEvent('settingsChanged', { detail: settings }));
    });
  }

  /**
   * Send message to all tabs to update settings
   * @param {Object} settings - The new settings
   */
  broadcastSettingsChange(settings) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && tab.url.includes('console.aws.amazon.com')) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'settingsUpdated',
            settings: settings
          });
        }
      });
    });
  }
} 
import { formatDateTime, convertDateTime, getCurrentDateTime } from '../utils/dateUtils.js';
import { getLocaleFlag } from '../utils/timezoneUtils.js';

export class DateConverter {
  constructor(datetimeInput, timestampResult, convertButton, timezoneToggle, helperText) {
    this.datetimeInput = datetimeInput;
    this.timestampResult = timestampResult;
    this.convertButton = convertButton;
    this.timezoneToggle = timezoneToggle;
    this.helperText = helperText;
  }

  updateHelperText() {
    this.helperText.textContent = this.timezoneToggle.checked ? 
      'Time is in UTC' : 'Time is in your local timezone';
  }

  updateTimestamp() {
    const datetime = this.datetimeInput.value;
    let timestamp;
    
    if (this.timezoneToggle.checked) {
      const [datePart, timePart] = datetime.split('T');
      const [year, month, day] = datePart.split('-');
      const [hours, minutes] = timePart.split(':');
      timestamp = Math.floor(Date.UTC(year, month - 1, day, hours, minutes) / 1000);
    } else {
      timestamp = Math.floor(new Date(datetime).getTime() / 1000);
    }

    const date = new Date(timestamp * 1000);
    const flagHtml = getLocaleFlag();
    
    const utcDate = formatDateTime(date, true);
    const localDate = formatDateTime(date, false);

    this.timestampResult.innerHTML = `<strong>🕓 Unix Timestamp</strong>\n${timestamp}\n\n<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local</strong>\n${localDate}`;
    this.convertButton.textContent = 'Copy Timestamp';
    return timestamp;
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
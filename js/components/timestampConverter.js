import { formatDateTime } from '../utils/dateUtils.js';
import { getLocaleFlag } from '../utils/timezoneUtils.js';

export class TimestampConverter {
  constructor(timestampInput, dateResult) {
    this.timestampInput = timestampInput;
    this.dateResult = dateResult;
  }

  convert() {
    const timestamp = this.timestampInput.value;
    const date = new Date(timestamp * 1000);
    const flagHtml = getLocaleFlag();
    
    const utcDate = formatDateTime(date, true);
    const localDate = formatDateTime(date, false);
    
    this.dateResult.innerHTML = `<strong>🌐 UTC</strong>\n${utcDate}\n\n<strong>${flagHtml} Local</strong>\n${localDate}`;
  }

  setCurrentTimestamp() {
    this.timestampInput.value = Math.floor(Date.now() / 1000);
    this.convert();
  }
} 
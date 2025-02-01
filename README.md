# AWS Unix Time Helper

A browser extension that makes working with Unix timestamps in AWS Console easier. It provides both a popup interface for timestamp conversions and automatic timestamp formatting in AWS DynamoDB tables.

![image](https://github.com/user-attachments/assets/1d16d41c-4a57-4c68-8b66-d0b8aab5b6bd)

## Features

### Popup Interface
- Convert Unix timestamps to human-readable dates (and vice versa)
- Support for both UTC and local timezone conversions
- One-click copy of timestamps
- Quick current time/timestamp population
- Displays timezone-specific country flags
- Clean, user-friendly interface

### AWS Console Integration
- Automatically detects Unix timestamps in DynamoDB tables
- Shows human-readable dates on hover
- Supports both 10-digit (seconds) and 13-digit (milliseconds) timestamps
- Updates dynamically as you navigate through tables

## Installation

1. Clone this repository:
```bash
git clone https://github.com/Rapalo/aws-unix-timestamp-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the extension directory

## Development

### Project Structure
```
├── js/
│   ├── components/          # UI components
│   │   ├── dateConverter.js
│   │   └── timestampConverter.js
│   ├── utils/              # Utility functions
│   │   ├── dateUtils.js
│   │   ├── flagUtils.js
│   │   └── timezoneUtils.js
│   └── popup.js            # Popup entry point
├── dist/                   # Bundled files
├── icons/                  # Extension icons
├── images/                 # Other images
├── manifest.json          # Extension manifest
├── popup.html            # Popup interface
└── content.js            # AWS Console integration
```

### Building
The extension uses webpack to bundle its JavaScript files. To build:

```bash
npm run build
```

## Testing
Load the extension in Chrome and:
1. Click the extension icon to test the popup interface
2. Visit AWS Console's DynamoDB tables to test the timestamp formatting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Country flags provided by [country-flag-icons](http://purecatamphetamine.github.io/country-flag-icons/)
- Built for use with AWS Console

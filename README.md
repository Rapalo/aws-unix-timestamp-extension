# AWS Unix Time Helper

A browser extension that makes working with Unix timestamps in AWS Console easier. It provides both a popup interface for timestamp conversions and automatic timestamp formatting in AWS DynamoDB tables.

![image](https://github.com/user-attachments/assets/54508756-bd6e-46f6-bd07-1b9df709e9ff)
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

### From Source
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

4. Load the extension in your browser:
   
   **Chrome/Edge:**
   - Navigate to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `dist` directory from the cloned repository

   **Firefox:**
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Select the `manifest.json` file from the cloned repository

## Usage

### Popup Interface
1. Click on the extension icon in your browser toolbar
2. Enter a Unix timestamp to convert it to a human-readable date
3. Or enter a date to convert it to a Unix timestamp
4. Toggle between UTC and local timezone using the buttons
5. Use the copy button to copy the converted value to your clipboard

### AWS Console Integration
1. Navigate to AWS DynamoDB tables in your browser
2. Unix timestamps will be automatically detected and formatted
3. Hover over formatted timestamps to see additional details

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
The extension uses webpack to bundle its JavaScript files:

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Browser Compatibility
- Chrome: 88+
- Edge: 88+
- Firefox: 86+
- Opera: 74+

## Testing
1. Load the extension in your browser
2. Click the extension icon to test the popup interface
3. Visit AWS Console's DynamoDB tables to test the timestamp formatting
4. Verify that timestamps are correctly detected and formatted

## Troubleshooting

### Common Issues
- If timestamps aren't being detected, refresh the AWS Console page
- If the popup isn't working correctly, try reloading the extension

### Reporting Bugs
Please report any bugs or issues on the [GitHub Issues page](https://github.com/Rapalo/aws-unix-timestamp-extension/issues).

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

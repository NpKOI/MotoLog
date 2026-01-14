# MotoLog iOS App (Capacitor)

This is a hybrid iOS app that wraps your Flask website using Capacitor, with native plugin support for camera, geolocation, and file system access.

## Architecture

```
mobile-app/
├── www/                 # Web content (built by Vite)
│   ├── index.html      # Main app shell
│   ├── main.ts         # Capacitor native bridge
│   └── [built assets]
├── ios/                # Native iOS code (generated)
├── capacitor.config.ts # Capacitor configuration
└── package.json        # Dependencies
```

## Setup for iOS Development

### Prerequisites
- macOS with Xcode installed
- Node.js 18+
- npm or yarn
- CocoaPods (for native iOS dependencies)

### 1. Install Dependencies
```bash
cd mobile-app
npm install
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Add iOS Platform
```bash
npx cap add ios
```

### 4. Sync Native Code
```bash
npx cap sync ios
```

### 5. Open in Xcode
```bash
npm run cap:open
# or
npx cap open ios
```

### 6. Configure Flask Server URL
Edit `mobile-app/www/main.ts` line 20:
```typescript
const FLASK_SERVER_URL = 'http://127.0.0.1:5000'; // Change to your server URL
```

For local testing: use `http://127.0.0.1:5000` (requires network bridge if on device)
For production: use your hosted Flask server URL

### 7. Build in Xcode
- Select your target device/simulator
- Click "Build and Run" (Cmd + R)
- Or go to Product → Build For → Running

## Development Workflow

### Watch Mode (Web Only)
```bash
npm run dev
```

### Full Build Pipeline
```bash
npm run cap:build
```
This runs: build → sync → open Xcode

### Update After Changes
After modifying Flask app:
```bash
npx cap sync ios
```

After modifying iOS code:
```bash
npx cap sync ios --update
```

## Native API Usage

### From Flask Web App (in JavaScript)

Your Flask website can now use native iOS features via the `MotoLogNative` object:

#### Camera Capture
```javascript
MotoLogNative.camera({
  quality: 90,
  allowEditing: false,
  resultType: 'uri',
  source: 'prompt'
}).then(result => console.log(result));
```

#### Geolocation
```javascript
MotoLogNative.geolocation({
  enableHighAccuracy: true,
  timeout: 5000
}).then(position => console.log(position));
```

#### File Operations
```javascript
// Save file
MotoLogNative.fileSave({
  path: 'rides/ride-data.gpx',
  data: '<xml>...</xml>'
});

// Read file
MotoLogNative.fileRead({
  path: 'rides/ride-data.gpx'
});
```

#### Local Storage Bridge
```javascript
MotoLogNative.storage({
  action: 'set',
  key: 'user_data',
  value: JSON.stringify(data)
});

MotoLogNative.storage({
  action: 'get',
  key: 'user_data'
}).then(result => console.log(result.value));
```

## App Lifecycle Events

The Flask app will receive lifecycle events via postMessage:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'NETWORK_STATUS') {
    console.log('Network:', event.data.connected);
  } else if (event.data.type === 'APP_STATE') {
    console.log('App active:', event.data.isActive);
  } else if (event.data.type === 'BACK_BUTTON') {
    console.log('Back button pressed');
  }
});
```

## iOS Permissions

The app needs these permissions in `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>MotoLog needs camera access to capture ride photos</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>MotoLog needs location access to track your rides</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>MotoLog needs location access to track your rides</string>

<key>NSFileProtectionComplete</key>
<string></string>
```

These are auto-added when you add plugins via Capacitor.

## Building for TestFlight / App Store

1. Create an Apple Developer account
2. Set up your bundle ID in Xcode (com.motoapp.ios)
3. Create certificates and provisioning profiles
4. In Xcode: Product → Archive
5. Distribute via TestFlight or App Store

## Troubleshooting

### White screen on iOS
- Check Xcode console for JavaScript errors
- Verify Flask server URL in `main.ts`
- Ensure network access is enabled

### Network errors
- For local testing on device: ensure Flask server is accessible from device's network
- On simulator: `localhost` works fine, but on device use your computer's IP

### Build errors
```bash
# Clean and rebuild
npm run build
npx cap sync ios --update
```

## Converting to React (Future)

When you're ready to migrate to React:
1. Replace `www/main.ts` with React components
2. The native bridges remain the same
3. Your native iOS code stays unchanged
4. Just rebuild and sync

## Resources

- [Capacitor Documentation](https://capacitorjs.com/)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Xcode Documentation](https://developer.apple.com/documentation/xcode)

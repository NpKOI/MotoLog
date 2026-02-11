import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';

// Initialize app
async function initializeApp() {
  console.log('🚀 MotoLog iOS App Initializing...');
  console.log('Platform:', Capacitor.getPlatform());
  
  // Setup app lifecycle
  setupAppListeners();
}

// App lifecycle listeners
function setupAppListeners() {
  // Handle app pause/resume
  App.addListener('appStateChange', state => {
    console.log('App state changed, isActive:', state.isActive);
  });
  
  // Handle back button
  App.addListener('backButton', () => {
    console.log('Back button pressed');
  });
}

// Start app
initializeApp().catch(err => {
  console.error('❌ Failed to initialize app:', err);
});

// Network status check
async function checkNetworkStatus() {
  Network.addListener('networkStatusChange', status => {
    console.log('Network status:', status.connected);
    
    // Notify web app of network changes
    postToIframe({
      type: 'NETWORK_STATUS',
      connected: status.connected
    });
  });
  
  const status = await Network.getStatus();
  console.log('Current network:', status.connected);
}

// App lifecycle listeners
function setupAppListeners() {
  // Handle app pause/resume
  App.addListener('appStateChange', state => {
    console.log('App state changed, isActive:', state.isActive);
    postToIframe({
      type: 'APP_STATE',
      isActive: state.isActive
    });
  });
  
  // Handle back button
  App.addListener('backButton', () => {
    console.log('Back button pressed');
    postToIframe({ type: 'BACK_BUTTON' });
  });
}

// Load Flask app in iframe
function loadFlaskApp() {
  const appDiv = document.getElementById('app');
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.id = IFRAME_ID;
  iframe.src = FLASK_SERVER_URL;
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.display = 'block';
  
  // Clear loading screen
  appDiv!.innerHTML = '';
  appDiv!.appendChild(iframe);
  
  console.log('✅ Flask app loaded in iframe');
}

// Post message to iframe
function postToIframe(data: any) {
  const iframe = document.getElementById(IFRAME_ID) as HTMLIFrameElement;
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(data, '*');
  }
}

// Listen to messages from iframe
window.addEventListener('message', async (event) => {
  const { type, data } = event.data;
  
  console.log('📨 Message from Flask app:', type);
  
  switch (type) {
    case 'NATIVE_CAMERA':
      handleCameraCapture(data);
      break;
    
    case 'NATIVE_GEOLOCATION':
      handleGeolocation(data);
      break;
    
    case 'NATIVE_FILE_SAVE':
      handleFileSave(data);
      break;
    
    case 'NATIVE_FILE_READ':
      handleFileRead(data);
      break;
    
    case 'NATIVE_STORAGE':
      handleStorage(data);
      break;
    
    default:
      console.log('Unknown message type:', type);
  }
});

// Camera capture handler
async function handleCameraCapture(options: any) {
  try {
    const { Camera } = await import('@capacitor/camera');
    const result = await Camera.getPhoto({
      quality: options.quality || 90,
      allowEditing: options.allowEditing || false,
      resultType: options.resultType || 'uri',
      source: options.source || 'prompt'
    });
    
    postToIframe({
      type: 'CAMERA_RESULT',
      data: result,
      requestId: options.requestId
    });
  } catch (err) {
    postToIframe({
      type: 'CAMERA_ERROR',
      error: (err as Error).message,
      requestId: options.requestId
    });
  }
}

// Geolocation handler
async function handleGeolocation(options: any) {
  try {
    const { Geolocation } = await import('@capacitor/geolocation');
    // Support watch / clearWatch actions
    if (options && options.action === 'watch') {
      // Start native watch and stream updates back to iframe
      const watchId = Geolocation.watchPosition({
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout || 5000,
        maximumAge: options.maximumAge || 0
      }, (position: any, err: any) => {
        if (err) {
          postToIframe({ type: 'GEOLOCATION_ERROR', error: err?.message || err, requestId: options.requestId });
          return;
        }
        postToIframe({ type: 'GEOLOCATION_WATCH_UPDATE', data: position, requestId: options.requestId });
      });

      // Keep track of native watch ids by requestId
      (handleGeolocation as any)._nativeWatches = (handleGeolocation as any)._nativeWatches || new Map();
      (handleGeolocation as any)._nativeWatches.set(options.requestId, watchId);

      postToIframe({ type: 'GEOLOCATION_WATCH_STARTED', requestId: options.requestId, nativeWatchId: watchId });
      return;
    }

    if (options && options.action === 'clearWatch') {
      const nativeWatches = (handleGeolocation as any)._nativeWatches || new Map();
      const nativeId = nativeWatches.get(options.requestId) || options.nativeWatchId;
      if (nativeId) {
        try {
          await Geolocation.clearWatch({ id: nativeId });
        } catch (e) {
          // ignore
        }
        nativeWatches.delete(options.requestId);
      }
      postToIframe({ type: 'GEOLOCATION_WATCH_CLEARED', requestId: options.requestId });
      return;
    }
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout || 5000,
      maximumAge: options.maximumAge || 0
    });
    
    postToIframe({
      type: 'GEOLOCATION_RESULT',
      data: position,
      requestId: options.requestId
    });
  } catch (err) {
    postToIframe({
      type: 'GEOLOCATION_ERROR',
      error: (err as Error).message,
      requestId: options.requestId
    });
  }
}

// File save handler
async function handleFileSave(options: any) {
  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    await Filesystem.writeFile({
      path: options.path,
      data: options.data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
      recursive: true
    });
    
    postToIframe({
      type: 'FILE_SAVE_RESULT',
      success: true,
      path: options.path,
      requestId: options.requestId
    });
  } catch (err) {
    postToIframe({
      type: 'FILE_SAVE_ERROR',
      error: (err as Error).message,
      requestId: options.requestId
    });
  }
}

// File read handler
async function handleFileRead(options: any) {
  try {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const result = await Filesystem.readFile({
      path: options.path,
      directory: Directory.Documents,
      encoding: Encoding.UTF8
    });
    
    postToIframe({
      type: 'FILE_READ_RESULT',
      data: result.data,
      requestId: options.requestId
    });
  } catch (err) {
    postToIframe({
      type: 'FILE_READ_ERROR',
      error: (err as Error).message,
      requestId: options.requestId
    });
  }
}

// Local storage handler (bridge to native storage)
async function handleStorage(options: any) {
  if (options.action === 'set') {
    localStorage.setItem(options.key, options.value);
    postToIframe({
      type: 'STORAGE_RESULT',
      success: true,
      requestId: options.requestId
    });
  } else if (options.action === 'get') {
    const value = localStorage.getItem(options.key);
    postToIframe({
      type: 'STORAGE_RESULT',
      value,
      requestId: options.requestId
    });
  }
}

// Setup native bridges
function setupNativeBridges() {
  // Expose to window for iframe access
  (window as any).MotoLogNative = {
    camera: (options: any) => postToIframe({ type: 'NATIVE_CAMERA', data: options }),
    geolocation: (options: any) => postToIframe({ type: 'NATIVE_GEOLOCATION', data: options }),
    fileSave: (options: any) => postToIframe({ type: 'NATIVE_FILE_SAVE', data: options }),
    fileRead: (options: any) => postToIframe({ type: 'NATIVE_FILE_READ', data: options }),
    storage: (options: any) => postToIframe({ type: 'NATIVE_STORAGE', data: options })
  };
  
  console.log('✅ Native bridges initialized');
}

// Start app
initializeApp().catch(err => {
  console.error('❌ Failed to initialize app:', err);
});

export { postToIframe };

(function(){
  // NativeGeo bridge for MotoLog — uses parent window postMessage when embedded in the Capacitor app.
  const isEmbedded = window.parent && window.parent !== window;
  const pending = new Map();
  let nextId = 1;
  const watches = new Map();

  function makeId(){ return `ng_${Date.now()}_${nextId++}`; }

  // Listen for messages from native host
  window.addEventListener('message', (event) => {
    const msg = event.data || {};
    if (!msg.type) return;

    // Geolocation single result
    if (msg.type === 'GEOLOCATION_RESULT' || msg.type === 'GEOLOCATION_ERROR') {
      const id = msg.requestId;
      const p = pending.get(id);
      if (!p) return;
      if (msg.type === 'GEOLOCATION_RESULT') {
        p.resolve(msg.data);
      } else {
        p.reject(msg.error || new Error('Geolocation error'));
      }
      pending.delete(id);
    }

    // Watch updates
    if (msg.type === 'GEOLOCATION_WATCH_UPDATE') {
      const id = msg.requestId;
      const cb = watches.get(id);
      if (cb && typeof cb === 'function') cb(msg.data);
    }

    if (msg.type === 'GEOLOCATION_WATCH_CLEARED' || msg.type === 'GEOLOCATION_WATCH_STARTED') {
      // noop for now; could surface nativeWatchId
    }
  });

  // Helper: post to parent
  function postToParent(type, data){
    if (!isEmbedded) return false;
    window.parent.postMessage({ type, data }, '*');
    return true;
  }

  // Public API
  const NativeGeo = {
    getCurrentPosition: function(options){
      options = options || {};
      // If embedded in Capacitor, ask native geolocation
      if (isEmbedded) {
        const id = makeId();
        const payload = Object.assign({}, options, { action: 'get', requestId: id });
        postToParent('NATIVE_GEOLOCATION', payload);
        return new Promise((resolve, reject) => {
          pending.set(id, { resolve, reject });
          // fallback to browser if native doesn't respond in 6s
          setTimeout(() => {
            if (pending.has(id)) {
              pending.delete(id);
              // fallback
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: options.timeout || 10000, maximumAge: options.maximumAge || 0 });
              } else {
                reject(new Error('No geolocation available'));
              }
            }
          }, 6000);
        });
      }

      // Not embedded: use browser geolocation
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error('Geolocation not available'));
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: options.timeout || 10000, maximumAge: options.maximumAge || 0 });
      });
    },

    watchPosition: function(successCb, errorCb, options){
      options = options || {};
      if (isEmbedded) {
        const id = makeId();
        watches.set(id, successCb);
        const payload = Object.assign({}, options, { action: 'watch', requestId: id });
        postToParent('NATIVE_GEOLOCATION', payload);
        // fallback: also start browser watch in case native fails to start
        const browserWatchId = navigator.geolocation ? navigator.geolocation.watchPosition(successCb, errorCb || (()=>{}), { enableHighAccuracy: true, timeout: options.timeout || 10000, maximumAge: options.maximumAge || 0 }) : null;
        watches.set(id + '_browser', browserWatchId);
        return id;
      }

      // Not embedded
      if (!navigator.geolocation) throw new Error('Geolocation not available');
      const wid = navigator.geolocation.watchPosition(successCb, errorCb || (()=>{}), { enableHighAccuracy: true, timeout: options.timeout || 10000, maximumAge: options.maximumAge || 0 });
      return wid;
    },

    clearWatch: function(watchId){
      if (!watchId) return;
      if (isEmbedded && typeof watchId === 'string' && watchId.indexOf('ng_') === 0) {
        // clear native watch
        postToParent('NATIVE_GEOLOCATION', { action: 'clearWatch', requestId: watchId });
        // also clear browser fallback if present
        const b = watches.get(watchId + '_browser');
        if (b != null && navigator.geolocation) navigator.geolocation.clearWatch(b);
        watches.delete(watchId);
        watches.delete(watchId + '_browser');
        return;
      }

      // assume numeric id from browser
      if (typeof watchId === 'number' && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
    }
  };

  // Expose global with safe name
  window.NativeGeo = NativeGeo;
  // Also expose MotoLogNative.geolocation wrapper if available
  if (!window.MotoLogNative) window.MotoLogNative = {};
  window.MotoLogNative.geolocation = function(options){
    // return a promise like navigator.geolocation.getCurrentPosition
    return NativeGeo.getCurrentPosition(options);
  };

})();

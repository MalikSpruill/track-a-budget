const APP_PREFIX = 'TrackABudget-';  // app name   
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION; // global contstant to keep track of which cache to use
const FILES_TO_CACHE = [
    "./index.html",
    "./css/styles.css",
    "./js/index.js",
];

// self refers to service-worker - if cache is available, respond with cache - else there is no cache, try fetching request
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url)
    e.respondWith(
      caches.match(e.request).then(function (request) {
        return request || fetch(e.request)
      })
    )
})

self.addEventListener('install', function (e) {
    e.waitUntil(
      caches.open(CACHE_NAME).then(function (cache) {
        console.log('installing cache : ' + CACHE_NAME)
        return cache.addAll(FILES_TO_CACHE)
      })
    )
})

// In the activation step, we clear out any old data from the cache and, in the same step, tell the service worker how to manage caches.
self.addEventListener('activate', function(e) {
    e.waitUntil(
      caches.keys().then(function(keyList) {
        let cacheKeeplist = keyList.filter(function(key) {
          return key.indexOf(APP_PREFIX);
        });
        cacheKeeplist.push(CACHE_NAME);
  
        return Promise.all(
          keyList.map(function(key, i) {
            if (cacheKeeplist.indexOf(key) === -1) {
              console.log('deleting cache : ' + keyList[i]);
              return caches.delete(keyList[i]);
            }
          })
        );
      })
    );
});



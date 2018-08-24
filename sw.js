self.importScripts('/js/idb.js');
self.importScripts('/js/util.js');
self.importScripts('/js/dbhelper.js');

const CACHE_STATIC_VERSION = 'v1';
const CACHE_DYNAMIC_VERSION = 'v1';

const CACHE_STATIC_NAME = `static_${CACHE_STATIC_VERSION}`;
const CACHE_DYNAMIC_NAME = `dynamic_${CACHE_DYNAMIC_VERSION}`;

const STATIC_FILES = [
    '/',
    '/index.html',
    '/restaurant.html',
    '/offline.html',
    '/img/sad.svg',
    '/img/refresh.svg',
    '/js/idb.js',
    '/js/util.js',
    '/js/dbhelper.js',
    '/js/main.js',
    '/js/restaurant_info.js',
    '/js/index.js',
    '/css/styles.css',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    console.log("[Service worker] Installing Service Worker...", event);
    event.waitUntil(
        // Open 'staatic' cache or create it if it doesn't exist
        caches.open(CACHE_STATIC_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell...');
                // Static Precaching main assets
                cache.addAll(STATIC_FILES);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log("[Service worker] Activating Service Worker...", event);
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[Service Worker] Removing old cache...', key);
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

/**
 * Checks if the request exists in cache
 * @param {*} target request path
 * @param {*} arr array of static files
 */
function existsInArray(target, arr) {
    let path;
    if (target.indexOf(self.origin) === 0) { // request target current domain where we serve page from
        path = target.substring(self.origin.length); // trim the domain to get relative path request
    } else {
        path = target; // store full path of CDN
    }
    return arr.indexOf(path) > -1;
}

self.addEventListener('fetch', (event) => {
    console.log("[Service worker] Fetching something...", event);
    if (event.request.url.indexOf(DBHelper.DATABASE_URL) > -1) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clonedResponse = response.clone();
                    clonedResponse.json()
                        .then((data) => {
                            console.log('[Service Worker] Restaurant JSON response...', data);
                            Utility.write(data, 'restaurants');
                        });
                    return response;
                })
        );
        console.log('[Service Worker] Fetching from REST server...', event);
    } else if (existsInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((localResponse) => {
                    // If the response exists in the cache
                    if(localResponse) {
                        // Returning cached assets
                        return localResponse;
                    } else {
                    // If the response doesn't exist in the cache
                        // Dynamic Caching
                        return fetch(event.request)
                            .then((serverResponse) => {
                                // Intercepts network request and returns it to original HTML when using `return` keyword
                                // Open 'dynamic' cache or create it if it doesn't exist
                                return caches.open(CACHE_DYNAMIC_NAME)
                                    .then((cache) => {
                                        // Storing a clone of network request in cache
                                        cache.put(event.request.url, serverResponse.clone());
                                        return serverResponse;
                                    })
                            })
                            .catch((err) => {
                                console.log("Can't connect!")
                                // Returning offline fallback page
                                return caches.open(CACHE_STATIC_NAME)
                                    .then((cache) => {
                                        if(event.request.headers.get('accept').includes('text/html')) {
                                            return cache.match('/offline.html');
                                        }
                                    })
                            })
                    }
                })
        );
    }
    
});
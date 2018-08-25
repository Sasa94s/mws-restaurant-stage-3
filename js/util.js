/**
 * IndexedDB Utility
 */

class Utility {
    static get dbPromise() {
        // if (!('indexedDB' in window)) {
        //     console.log('[IndexedDB] This browser doesn\'t support IndexedDB');
        //     return Promise.reject('This browser doesn\'t support IndexedDB');
        // }
        
        // Open a new database if not exists to create `restaurants` object if exists
        return idb.open('restaurants-info', 1, (db) => {
            console.log('[IndexedDB] Database has been accessed...', this.dbPromise);
            if (!db.objectStoreNames.contains('restaurants')) {
                db.createObjectStore('restaurants', { keyPath: 'id' });
                console.log('[IndexedDB] Object store has been created');
            }
        });
    }
    
    static write(data, st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] All restaurants info before saved in IDB...', data);
            data.map(restaurant => store.put(restaurant));
            return tx.complete;
        });
    }
    
    static read(restaurant, st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] Read data...', restaurant);
            return store.get(parseInt(restaurant));
        })
        .then((restaurant) => {
            if (restaurant) {
                console.log("[IndexedDB] Fetch Restaurant", restaurant);
                return Promise.resolve(restaurant);
            } else {
                return Promise.reject('Can\'t find Restaurant in IndexedDB');
            }
        });
    }
    
    static readAll(st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] Read all data...', store.getAll());
            return store.getAll();
        })
        .then((restaurants) => {
            if (restaurants.length) {
                console.log("[IndexedDB] Fetch Restaurants", restaurants);
                return Promise.resolve(restaurants);
            } else {
                return Promise.reject('Can\'t find Restaurant in IndexedDB', restaurants);
            }
        });
    }
}
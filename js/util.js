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
            for (const restaurant in data) {
                console.log('[IndexedDB] Restaurant info before saved in IDB...', data[restaurant]);
                store.put(data[restaurant]);
            }
            return tx.complete;
        });
    }
    
    static read(restaurant, st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] Read data...', restaurant, store.get(restaurant));
            return store.get(parseInt(restaurant));
        });
    }
    
    static readAll(st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] Read all data...', store.getAll());
            return store.getAll();
        });
    }
}
/**
 * IndexedDB Utility
 */

class Utility {
    static get dbPromise() {
        // Open a new database if not exists to create `restaurants` object if exists
        return idb.open('restaurants-info', 1, (db) => {
            console.log('[IndexedDB] Database has been accessed...', this.dbPromise);
            if (!db.objectStoreNames.contains('restaurants')) {
                db.createObjectStore('restaurants', { keyPath: 'id' });
                console.log('[IndexedDB] Restaurants Object store has been created');
            }
            if (!db.objectStoreNames.contains('reviews')) {
                const reviewsStore = db.createObjectStore('reviews', { keyPath: 'id' });
                reviewsStore.createIndex('restaurant', 'restaurant_id', {unique: false});
                console.log('[IndexedDB] Reviews Object store has been created');
            }
        });
    }
    
    static write(data, st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readwrite');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] All data before saved in IDB...', data);
            if (data.length === undefined) {
                store.put(data);
            } else {
                data.map(record => store.put(record));
            }
            return tx.complete;
        });
    }
    
    /**
     * Get a record from ObjectStore by key
     */
    static read(key, st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            console.log('[IndexedDB] Read data...', key);
            return store.get(parseInt(key));
        })
        .then((record) => {
            if (record) {
                console.log("[IndexedDB] Fetch record...", record);
                return Promise.resolve(record);
            } else {
                return Promise.reject('Can\'t find Restaurant in IndexedDB');
            }
        });
    }

    /**
     * Get an ObjectStore by key
     */
    static readByKey(key, idx, st) {
        return Utility.dbPromise.then((db) => {
            let store = db.transaction(st, 'readonly').objectStore(st);
            let indexId = store.index(idx);
            const data = indexId.getAll(parseInt(key));
            console.log('[IndexedDB] Read all data by key...', data);
            return data;
        })
        .then((records) => {
            if (records.length) {
                console.log("[IndexedDB] Fetch all records..", records);
                return Promise.resolve(records);
            } else {
                return Promise.reject('Can\'t find Restaurant in IndexedDB', records);
            }
        });
    }
    
    /**
     * Get all records from an ObjectStore
     */
    static readAll(st) {
        return Utility.dbPromise.then((db) => {
            let tx = db.transaction(st, 'readonly');
            let store = tx.objectStore(st);
            const data = store.getAll();
            console.log('[IndexedDB] Read all data...', data);
            return data;
        })
        .then((records) => {
            if (records.length) {
                console.log("[IndexedDB] Fetch all records..", records);
                return Promise.resolve(records);
            } else {
                return Promise.reject('Can\'t find Restaurant in IndexedDB', records);
            }
        });
    }
}
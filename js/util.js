// Open a new database if not exists to create `restaurants` object if exists
var dbPromise = idb.open('restaurants-info', 1, (db) => {
    if (!db.objectStoreNames.contains('restaurants')) {
        db.createObjectStore('restaurants', { keyPath: 'id' });
        console.log('[IndexedDB] Object store has been created');
    }
});

function write(data, st) {
    dbPromise.then((db) => {
        let tx = db.transaction(st, 'readwrite');
        let store = tx.objectStore(st);
        for (restaurant in data) {
            console.log('[IndexedDB] Restaurant info before saved in IDB...', data[restaurant]);
            store.put(data[restaurant]);
        }
        return tx.complete;
    });
}
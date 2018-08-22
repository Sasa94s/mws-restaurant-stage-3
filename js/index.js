if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then((registeration) => {
            console.log("[Index] Service worker registered!", registeration.scope);
        })
        .catch((error) => {
            console.log("[Index] Service worker registeration failed", error);
        });
}
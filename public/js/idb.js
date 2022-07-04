let db;
const request = indexedDB.open('TrackABudget', 1); // Connection to IndexedDB database "TrackABudget" version 1

request.onupgradeneeded = function(event) { // Is invoked if database changes/upgrades versions
    const db = event.target.result;
    db.createObjectStore('stored_budget', { autoIncrement: true });
};

request.onsuccess = function(event) { // Is invoked on success of established connection or database upgrade
    db = event.target.result;
  
    if (navigator.onLine) {
      uploadBudget();
    }
};
  
request.onerror = function(event) { // Is invoked on error
    console.log(event.target.errorCode);
};

function saveRecord(record) { // This function will be executed if we attempt to submit a new budget and there's no internet connection
    const transaction = db.transaction(['stored_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('stored_budget');
  
    budgetObjectStore.add(record);
}

function uploadBudget() { // This function will 
    const transaction = db.transaction(['stored_budget'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('stored_budget');
    const getAll = budgetObjectStore.getAll();
  
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }

            const transaction = db.transaction(['stored_budget'], 'readwrite');
            const budgetObjectStore = transaction.objectStore('stored_budget');

            budgetObjectStore.clear();

            alert('All saved transactions have been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadBudget);
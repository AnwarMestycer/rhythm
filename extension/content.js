// Content script to relay messages from web page to extension
console.log('Rhythm content script loaded')

// Listen for messages from the web page
window.addEventListener('message', (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return

    if (event.data.type === 'RHYTHM_SYNC_SESSION') {
        console.log('Content script received session sync')
        // Forward to service worker
        chrome.runtime.sendMessage({
            action: 'syncSession',
            session: event.data.session,
            reminders: event.data.reminders
        }, (response) => {
            console.log('Session sync response:', response)
        })
    } else if (event.data.type === 'RHYTHM_UPDATE_REMINDERS') {
        console.log('Content script received reminder update')
        // Forward to service worker
        chrome.runtime.sendMessage({
            action: 'updateReminders',
            reminders: event.data.reminders
        }, (response) => {
            console.log('Reminder update response:', response)
        })
    }
})

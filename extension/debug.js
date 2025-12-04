const output = document.getElementById('output')

function log(message) {
    output.textContent += message + '\n'
    console.log(message)
}

document.getElementById('test-notification').addEventListener('click', () => {
    log('Testing notification...')
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: 'Test Notification',
        message: 'This is a test notification from Rhythm!',
        priority: 2
    }, (notificationId) => {
        log('Notification created: ' + notificationId)
    })
})

document.getElementById('check-reminders').addEventListener('click', async () => {
    log('Sending check reminders message to service worker...')
    chrome.runtime.sendMessage({ action: 'checkNow' }, (response) => {
        log('Response: ' + JSON.stringify(response))
    })
})

document.getElementById('view-storage').addEventListener('click', async () => {
    const data = await chrome.storage.local.get(null)
    log('Storage contents:')
    log(JSON.stringify(data, null, 2))
})

document.getElementById('test-alarm').addEventListener('click', async () => {
    log('Getting all alarms...')
    chrome.alarms.getAll((alarms) => {
        log('Active alarms: ' + JSON.stringify(alarms, null, 2))
    })
})

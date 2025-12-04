// Simple popup that fetches reminders from storage
// The service worker handles all Supabase communication

const authView = document.getElementById('auth-view')
const mainView = document.getElementById('main-view')
const openWebBtn = document.getElementById('open-web-btn')
const refreshBtn = document.getElementById('refresh-btn')
const remindersList = document.getElementById('reminders-list')
const notificationsToggle = document.getElementById('notifications-toggle')

// Check if we have reminders in storage
async function init() {
    const result = await chrome.storage.local.get(['reminders', 'notificationsEnabled'])
    const reminders = result.reminders || []
    const notificationsEnabled = result.notificationsEnabled !== false // default true

    notificationsToggle.checked = notificationsEnabled

    if (reminders.length === 0) {
        showAuthView()
    } else {
        showMainView()
        renderReminders(reminders)
    }
}

function showAuthView() {
    authView.classList.remove('hidden')
    mainView.classList.add('hidden')
}

function showMainView() {
    authView.classList.add('hidden')
    mainView.classList.remove('hidden')
}

function renderReminders(reminders) {
    remindersList.innerHTML = ''

    if (reminders.length === 0) {
        remindersList.innerHTML = '<p class="text-gray-500 text-center">No active reminders. Create one in the web app!</p>'
        return
    }

    reminders.forEach(reminder => {
        const el = document.createElement('div')
        el.className = 'reminder-item'
        el.innerHTML = `
      <div class="reminder-info">
        <h3>${escapeHtml(reminder.title)}</h3>
        <p>${reminder.schedule_type === 'interval' ? `Every ${reminder.interval_minutes}m` : reminder.time_of_day}</p>
        <span class="badge">${escapeHtml(reminder.type)}</span>
      </div>
    `
        remindersList.appendChild(el)
    })
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Event listeners
openWebBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/login' })
})

refreshBtn.addEventListener('click', async () => {
    remindersList.innerHTML = '<p class="loading">Refreshing...</p>'
    // Ask service worker to refresh
    chrome.runtime.sendMessage({ action: 'refreshReminders' }, (response) => {
        if (response && response.reminders) {
            renderReminders(response.reminders)
            if (response.reminders.length > 0) {
                showMainView()
            }
        }
    })
})

notificationsToggle.addEventListener('change', (e) => {
    chrome.storage.local.set({ notificationsEnabled: e.target.checked })
})

// Listen for updates from service worker
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.reminders) {
        const reminders = changes.reminders.newValue || []
        renderReminders(reminders)
        if (reminders.length > 0) {
            showMainView()
        }
    }
})

init()

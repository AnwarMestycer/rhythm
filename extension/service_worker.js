// Service worker for Rhythm extension
// Uses native fetch API to communicate with Supabase instead of SDK

const SUPABASE_URL = 'https://qdimtzzdcfjpwpbsomiy.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkaW10enpkY2ZqcHdwYnNvbWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjQ2ODEsImV4cCI6MjA3OTc0MDY4MX0.MC3Be3RlAqcK9gSmQ3Jg4FWn63JgOLjC6Hf5NQYAh9Y'

let reminders = []

// Initialize - fetch reminders on install
chrome.runtime.onInstalled.addListener(() => {
    console.log('Rhythm extension installed')
    fetchReminders()
})

// Fetch reminders when browser starts
chrome.runtime.onStartup.addListener(() => {
    console.log('Browser started - fetching reminders')
    fetchReminders()
})

// Fetch reminders from Supabase
async function fetchReminders() {
    try {
        // Get session from storage
        const { session } = await chrome.storage.local.get(['session'])

        if (!session || !session.access_token) {
            console.log('No session found, cannot fetch reminders')
            return
        }

        const response = await fetch(`${SUPABASE_URL}/rest/v1/reminders?is_active=eq.true&select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            reminders = await response.json()
            await chrome.storage.local.set({ reminders })
            console.log('Fetched reminders:', reminders.length, reminders)
        } else {
            console.error('Failed to fetch reminders:', response.status, await response.text())
        }
    } catch (error) {
        console.error('Error fetching reminders:', error)
    }
}

// Listen for messages from popup and content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'syncSession') {
        console.log('Received session sync')
        chrome.storage.local.set({
            session: request.session,
            reminders: request.reminders || []
        }).then(() => {
            reminders = request.reminders || []
            console.log('Session and reminders stored:', reminders.length)
            sendResponse({ success: true })
        })
        return true
    } else if (request.action === 'updateReminders') {
        console.log('Received reminder update')
        chrome.storage.local.set({ reminders: request.reminders }).then(() => {
            reminders = request.reminders
            console.log('Reminders updated:', reminders.length)
            sendResponse({ success: true })
        })
        return true
    } else if (request.action === 'refreshReminders') {
        fetchReminders().then(() => {
            sendResponse({ reminders })
        })
        return true
    } else if (request.action === 'checkNow') {
        console.log('Manual check requested')
        checkReminders().then(() => {
            sendResponse({ status: 'checked', remindersCount: reminders.length })
        })
        return true
    }
})

// Check for due reminders every minute
chrome.alarms.create('checkReminders', { periodInMinutes: 1 })

// Refresh reminders every 5 minutes to stay in sync
chrome.alarms.create('syncReminders', { periodInMinutes: 5 })

// Single alarm listener for all alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
    console.log('Alarm fired:', alarm.name)

    if (alarm.name === 'checkReminders') {
        await checkReminders()
    } else if (alarm.name === 'syncReminders') {
        await fetchReminders()
    }
})

async function checkReminders() {
    console.log('Checking reminders...')

    // Get settings
    const result = await chrome.storage.local.get(['reminders', 'notificationsEnabled'])
    reminders = result.reminders || []
    const notificationsEnabled = result.notificationsEnabled !== false

    console.log('Reminders count:', reminders.length, 'Notifications enabled:', notificationsEnabled)

    if (!notificationsEnabled || reminders.length === 0) {
        console.log('Skipping check - notifications disabled or no reminders')
        return
    }

    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()

    console.log('Current time:', now.toLocaleTimeString(), 'Day:', currentDay)

    for (const reminder of reminders) {
        console.log('Checking reminder:', reminder.title, 'Type:', reminder.schedule_type)

        // Check day filter
        if (reminder.days && reminder.days.length > 0 && !reminder.days.includes(currentDay)) {
            console.log('Skipping - not scheduled for today')
            continue
        }

        if (reminder.schedule_type === 'time') {
            // Time based
            const [h, m] = reminder.time_of_day.split(':').map(Number)
            console.log('Time-based reminder - scheduled for', `${h}:${m}`, 'current:', `${now.getHours()}:${now.getMinutes()}`)
            if (now.getHours() === h && now.getMinutes() === m) {
                console.log('Triggering time-based notification')
                triggerNotification(reminder)
            }
        } else if (reminder.schedule_type === 'interval') {
            // Interval based
            const lastTriggeredKey = `last_triggered_${reminder.id}`
            const lastTriggered = (await chrome.storage.local.get(lastTriggeredKey))[lastTriggeredKey]

            console.log('Interval-based reminder - interval:', reminder.interval_minutes, 'minutes')
            console.log('Last triggered:', lastTriggered ? new Date(lastTriggered).toLocaleTimeString() : 'never')

            if (!lastTriggered) {
                // First time, trigger and save
                console.log('First time - triggering notification')
                triggerNotification(reminder)
            } else {
                const diff = (now.getTime() - lastTriggered) / 1000 / 60 // minutes
                console.log('Time since last trigger:', diff.toFixed(2), 'minutes')
                if (diff >= reminder.interval_minutes) {
                    console.log('Interval elapsed - triggering notification')
                    triggerNotification(reminder)
                }
            }
        }
    }
}

function triggerNotification(reminder) {
    const iconMap = {
        'hydration': '💧',
        'posture': '🧘',
        'break': '☕',
        'meal': '🍽️',
        'gym': '💪',
        'prayer': '🙏',
        'wake-up': '⏰',
        'custom': '⏰'
    }

    console.log('Creating notification for:', reminder.title)

    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon128.png',
        title: `${iconMap[reminder.type] || '⏰'} ${reminder.title}`,
        message: `It's time for your ${reminder.type} reminder!`,
        priority: 2
    }, (notificationId) => {
        console.log('Notification created:', notificationId)
    })

    // Update last triggered
    const key = `last_triggered_${reminder.id}`
    chrome.storage.local.set({ [key]: Date.now() })
    console.log('Updated last triggered time for:', reminder.title)
}

// Initial fetch
console.log('Service worker starting...')
fetchReminders()

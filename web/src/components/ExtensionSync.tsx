'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Reminder } from '@/types'

// Declare chrome API for TypeScript
declare const chrome: any

const EXTENSION_ID = 'mplpcbdfhihoieocmpdgfjmgnipdohji' // Will be updated after extension is loaded

interface ExtensionSyncProps {
    reminders: Reminder[]
}

export default function ExtensionSync({ reminders }: ExtensionSyncProps) {
    const supabase = createClient()

    useEffect(() => {
        async function syncToExtension() {
            // Get the current session
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                console.log('No session found, skipping extension sync')
                return
            }

            // Send session via window.postMessage for extension to pick up
            console.log('Sending session to extension via postMessage')
            window.postMessage({
                type: 'RHYTHM_SYNC_SESSION',
                session: {
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    expires_at: session.expires_at,
                    user: session.user
                },
                reminders
            }, '*')
        }

        syncToExtension()

        // Set up realtime listener to sync reminder changes
        const channel = supabase
            .channel('reminder_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'reminders',
                },
                async (payload) => {
                    console.log('Reminder changed, syncing to extension:', payload)

                    // Fetch updated reminders
                    const { data: { user } } = await supabase.auth.getUser()
                    if (!user) return

                    const { data: updatedReminders } = await supabase
                        .from('reminders')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })

                    // Send to extension via postMessage
                    console.log('Sending reminder update to extension')
                    window.postMessage({
                        type: 'RHYTHM_UPDATE_REMINDERS',
                        reminders: updatedReminders || []
                    }, '*')
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [reminders, supabase])

    return null // This component doesn't render anything
}

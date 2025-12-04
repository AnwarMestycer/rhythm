export type Reminder = {
    id: string
    user_id: string
    title: string
    type: 'hydration' | 'posture' | 'break' | 'meal' | 'gym' | 'prayer' | 'wake-up' | 'custom'
    schedule_type: 'interval' | 'time'
    interval_minutes: number | null
    time_of_day: string | null
    days: string[] | null
    is_active: boolean
    created_at: string
}

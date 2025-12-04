import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ReminderList from '@/components/ReminderList'
import { CreateReminderDialog } from '@/components/CreateReminderDialog'
import ExtensionSync from '@/components/ExtensionSync'
import { Reminder } from '@/types'

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-xl font-bold text-indigo-600">Rhythm</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-4">{user.email}</span>
              <form action="/auth/signout" method="post">
                <button className="text-sm font-medium text-gray-500 hover:text-gray-700">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                Your Reminders
              </h2>
              <CreateReminderDialog />
            </div>
            <ExtensionSync reminders={(reminders as Reminder[]) || []} />
            <ReminderList initialReminders={(reminders as Reminder[]) || []} />
          </div>
        </div>
      </main>
    </div>
  )
}

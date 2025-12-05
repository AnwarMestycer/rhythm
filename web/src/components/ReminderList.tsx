'use client'

import { Reminder } from '@/types'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

interface ReminderListProps {
  initialReminders: Reminder[]
}

export default function ReminderList({ initialReminders }: ReminderListProps) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('realtime reminders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reminders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setReminders((prev) => [payload.new as Reminder, ...prev])
          } else if (payload.eventType === 'DELETE') {
            setReminders((prev) => prev.filter((r) => r.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setReminders((prev) =>
              prev.map((r) => (r.id === payload.new.id ? (payload.new as Reminder) : r))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('reminders')
      .update({ is_active: !currentState })
      .eq('id', id)

    if (error) {
      console.error('Error updating reminder:', error)
      return
    }

    setReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, is_active: !currentState } : r
      )
    )
  }

  const handleDeleteClick = (reminder: Reminder) => {
    setReminderToDelete(reminder)
  }

  const confirmDelete = async () => {
    if (!reminderToDelete) return

    setIsDeleting(true)
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderToDelete.id)

    if (error) {
      console.error('Error deleting reminder:', error)
      setIsDeleting(false)
      return
    }

    setReminders(reminders.filter((r) => r.id !== reminderToDelete.id))
    setReminderToDelete(null)
    setIsDeleting(false)
  }

  const cancelDelete = () => {
    setReminderToDelete(null)
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reminders.map((reminder) => (
          <Card key={reminder.id} className={!reminder.is_active ? 'opacity-60' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {reminder.title}
              </CardTitle>
              <Switch
                checked={reminder.is_active}
                onCheckedChange={() => toggleActive(reminder.id, reminder.is_active)}
              />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <Badge variant="secondary" className="mr-2">
                    {reminder.type}
                  </Badge>
                  <div className="text-2xl font-bold">
                    {reminder.schedule_type === 'interval'
                      ? `Every ${reminder.interval_minutes}m`
                      : reminder.time_of_day}
                  </div>
                  {reminder.days && (
                    <p className="text-xs text-muted-foreground">
                      {reminder.days.join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(reminder)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reminders.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-500">
            No reminders yet. Create one to get started!
          </div>
        )}
      </div>

      <Dialog open={!!reminderToDelete} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reminder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{reminderToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  type: z.enum(['hydration', 'posture', 'break', 'meal', 'gym', 'prayer', 'wake-up', 'custom']),
  schedule_type: z.enum(['interval', 'time']),
  interval_minutes: z.string().optional(), // Input is text, convert to number
  time_of_day: z.string().optional(),
})

export function CreateReminderDialog() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'hydration',
      schedule_type: 'interval',
      interval_minutes: '30',
      time_of_day: '09:00',
    },
  })

  const scheduleType = form.watch('schedule_type')

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return

    const reminderData = {
      user_id: user.id,
      title: values.title,
      type: values.type,
      schedule_type: values.schedule_type,
      interval_minutes: values.schedule_type === 'interval' ? parseInt(values.interval_minutes || '0') : null,
      time_of_day: values.schedule_type === 'time' ? values.time_of_day : null,
      is_active: true,
    }

    const { error } = await supabase.from('reminders').insert(reminderData)

    if (error) {
      console.error('Error creating reminder:', error)
      return
    }

    setOpen(false)
    form.reset()
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Reminder</DialogTitle>
          <DialogDescription>
            Add a new reminder to your schedule.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Drink water" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="hydration">Hydration</SelectItem>
                      <SelectItem value="posture">Posture</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="meal">Meal</SelectItem>
                      <SelectItem value="gym">Gym</SelectItem>
                      <SelectItem value="prayer">Prayer</SelectItem>
                      <SelectItem value="wake-up">Wake-up</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Schedule Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="interval">Interval</SelectItem>
                      <SelectItem value="time">Exact Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {scheduleType === 'interval' && (
              <FormField
                control={form.control}
                name="interval_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {scheduleType === 'time' && (
              <FormField
                control={form.control}
                name="time_of_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="submit">Save Reminder</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

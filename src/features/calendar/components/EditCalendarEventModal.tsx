import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { toDatetimeLocalValue } from '@/shared/utils/formatDate';
import type { CalendarEvent } from '@/shared/types/domain';
import { useUpdateCalendarEvent } from '../hooks/useCalendar';

const eventSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200),
    eventDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.eventDate), {
    message: 'End date must be after the start date',
    path: ['endDate'],
  });

type EventFormValues = z.infer<typeof eventSchema>;

interface EditCalendarEventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EditCalendarEventModal({ event, onClose }: EditCalendarEventModalProps) {
  const updateEvent = useUpdateCalendarEvent();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    values: event
      ? {
          title: event.title,
          eventDate: toDatetimeLocalValue(event.eventDate),
          endDate: toDatetimeLocalValue(event.endDate ?? event.eventDate),
        }
      : undefined,
  });

  if (!event) return null;

  const onSubmit = handleSubmit((values) => {
    updateEvent.mutate(
      {
        id: event.id,
        payload: {
          title: values.title,
          eventDate: new Date(values.eventDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        },
      },
      {
        onSuccess: () => {
          toast.success('Calendar event updated.');
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(event)}
      onClose={onClose}
      title="Edit calendar event"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="calendar-event-form" isLoading={updateEvent.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id="calendar-event-form" className="stack" noValidate>
        {updateEvent.isError && <ErrorBanner error={updateEvent.error} />}

        <FormField label="Title" error={errors.title?.message} required>
          {(fieldProps) => <Input {...fieldProps} {...register('title')} />}
        </FormField>

        <FormField label="Start date & time" error={errors.eventDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('eventDate')} />}
        </FormField>

        <FormField label="End date & time" error={errors.endDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('endDate')} />}
        </FormField>
      </form>
    </Modal>
  );
}

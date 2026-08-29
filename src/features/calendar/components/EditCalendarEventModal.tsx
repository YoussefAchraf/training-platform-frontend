import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Modal } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { useToast } from '@/shared/hooks/useToast';
import { toDatetimeLocalValue } from '@/shared/utils/formatDate';
import type { CalendarEvent } from '@/shared/types/domain';
import { useUpdateCalendarEvent } from '../hooks/useCalendar';

function buildEventSchema(t: TFunction<'calendar'>) {
  return z
    .object({
      title: z.string().trim().min(1, t('EditCalendarEventModal.errors.titleRequired')).max(200),
      eventDate: z.string().min(1, t('EditCalendarEventModal.errors.startDateRequired')),
      endDate: z.string().min(1, t('EditCalendarEventModal.errors.endDateRequired')),
    })
    .refine((data) => new Date(data.endDate) > new Date(data.eventDate), {
      message: t('EditCalendarEventModal.errors.endAfterStart'),
      path: ['endDate'],
    });
}

type EventFormValues = z.infer<ReturnType<typeof buildEventSchema>>;

interface EditCalendarEventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EditCalendarEventModal({ event, onClose }: EditCalendarEventModalProps) {
  const { t } = useTranslation('calendar');
  const updateEvent = useUpdateCalendarEvent();
  const toast = useToast();
  const eventSchema = useMemo(() => buildEventSchema(t), [t]);

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
          toast.success(t('EditCalendarEventModal.eventUpdated'));
          onClose();
        },
      },
    );
  });

  return (
    <Modal
      isOpen={Boolean(event)}
      onClose={onClose}
      title={t('EditCalendarEventModal.title')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('EditCalendarEventModal.cancel')}
          </Button>
          <Button type="submit" form="calendar-event-form" isLoading={updateEvent.isPending}>
            {t('EditCalendarEventModal.saveChanges')}
          </Button>
        </>
      }
    >
      <form onSubmit={onSubmit} id="calendar-event-form" className="stack" noValidate>
        {updateEvent.isError && <ErrorBanner error={updateEvent.error} />}

        <FormField label={t('EditCalendarEventModal.titleLabel')} error={errors.title?.message} required>
          {(fieldProps) => <Input {...fieldProps} {...register('title')} />}
        </FormField>

        <FormField label={t('EditCalendarEventModal.startDateTimeLabel')} error={errors.eventDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('eventDate')} />}
        </FormField>

        <FormField label={t('EditCalendarEventModal.endDateTimeLabel')} error={errors.endDate?.message} required>
          {(fieldProps) => <Input type="datetime-local" {...fieldProps} {...register('endDate')} />}
        </FormField>
      </form>
    </Modal>
  );
}

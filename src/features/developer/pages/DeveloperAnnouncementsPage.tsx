import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { motion } from 'motion/react';
import { Megaphone } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Input } from '@/shared/components/Input';
import { Textarea } from '@/shared/components/Textarea';
import { Checkbox } from '@/shared/components/Checkbox';
import { Badge } from '@/shared/components/Badge';
import { StarRating } from '@/shared/components/StarRating';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { Skeleton } from '@/shared/components/Skeleton';
import { useToast } from '@/shared/hooks/useToast';
import { getApiErrorMessage } from '@/shared/lib/apiClient';
import { formatDate } from '@/shared/utils/formatDate';
import { roleMeta } from '@/shared/utils/statusMeta';
import { staggerContainer, listItem } from '@/shared/motion/variants';
import type { TargetableRole } from '@/shared/types/domain';
import { useAnnouncements, useCreateAnnouncement } from '../../announcements/hooks/useAnnouncements';
import styles from './DeveloperAnnouncementsPage.module.css';

const TARGETABLE_ROLES: TargetableRole[] = ['Sales', 'Manager', 'Instructor', 'SuperAdmin'];

function buildAnnouncementSchema(t: TFunction<'developer'>) {
  return z.object({
    title: z.string().trim().min(1, t('DeveloperAnnouncementsPage.errors.titleRequired')).max(200),
    description: z.string().trim().min(1, t('DeveloperAnnouncementsPage.errors.descriptionRequired')).max(4000),
    targetRoles: z
      .array(z.enum(TARGETABLE_ROLES))
      .min(1, t('DeveloperAnnouncementsPage.errors.targetRolesRequired')),
  });
}

type AnnouncementFormValues = z.infer<ReturnType<typeof buildAnnouncementSchema>>;

export function DeveloperAnnouncementsPage() {
  const { t } = useTranslation('developer');
  const announcementsQuery = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const toast = useToast();
  const schema = useMemo(() => buildAnnouncementSchema(t), [t]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', targetRoles: [] },
  });

  const onSubmit = handleSubmit((values) => {
    createAnnouncement.mutate(values, {
      onSuccess: () => {
        toast.success(t('DeveloperAnnouncementsPage.publishSuccess'));
        reset({ title: '', description: '', targetRoles: [] });
      },
      onError: (error) => toast.error(getApiErrorMessage(error, t('DeveloperAnnouncementsPage.genericError'))),
    });
  });

  const announcements = announcementsQuery.data ?? [];

  return (
    <div>
      <PageHeader title={t('DeveloperAnnouncementsPage.title')} description={t('DeveloperAnnouncementsPage.description')} />

      <Card className={styles.formCard}>
        <h3 className={styles.formTitle}>{t('DeveloperAnnouncementsPage.formTitle')}</h3>
        <form onSubmit={onSubmit} className="stack" noValidate>
          {createAnnouncement.isError && <ErrorBanner error={createAnnouncement.error} />}

          <FormField label={t('DeveloperAnnouncementsPage.titleLabel')} error={errors.title?.message} required>
            {(fieldProps) => (
              <Input placeholder={t('DeveloperAnnouncementsPage.titlePlaceholder')} {...fieldProps} {...register('title')} />
            )}
          </FormField>

          <FormField
            label={t('DeveloperAnnouncementsPage.descriptionLabel')}
            error={errors.description?.message}
            required
          >
            {(fieldProps) => (
              <Textarea
                rows={4}
                placeholder={t('DeveloperAnnouncementsPage.descriptionPlaceholder')}
                {...fieldProps}
                {...register('description')}
              />
            )}
          </FormField>

          <FormField
            label={t('DeveloperAnnouncementsPage.targetRolesLabel')}
            error={errors.targetRoles?.message}
            required
          >
            {() => (
              <div className={styles.roleChecks}>
                {TARGETABLE_ROLES.map((role) => (
                  <Checkbox key={role} value={role} label={t(roleMeta[role].labelKey)} {...register('targetRoles')} />
                ))}
              </div>
            )}
          </FormField>

          <Button type="submit" isLoading={createAnnouncement.isPending} leftIcon={<Megaphone size={16} />}>
            {t('DeveloperAnnouncementsPage.publish')}
          </Button>
        </form>
      </Card>

      {announcementsQuery.isError ? (
        <ErrorBanner error={announcementsQuery.error} onRetry={() => announcementsQuery.refetch()} />
      ) : announcementsQuery.isPending ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} height={140} radius="var(--radius-lg)" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={t('DeveloperAnnouncementsPage.emptyTitle')}
          description={t('DeveloperAnnouncementsPage.emptyDescription')}
        />
      ) : (
        <motion.ul className={styles.list} variants={staggerContainer(0.03)} initial="hidden" animate="show">
          {announcements.map((announcement) => (
            <motion.li key={announcement.id} variants={listItem}>
              <Card className={styles.announcementCard} padded>
                <div className={styles.announcementHeader}>
                  <div>
                    <h4 className={styles.announcementTitle}>{announcement.title}</h4>
                    <p className={styles.publishedOn}>
                      {t('DeveloperAnnouncementsPage.publishedOn', { date: formatDate(announcement.createdAt) })}
                    </p>
                  </div>
                  <div className={styles.targetRoles}>
                    {announcement.targetRoles.map((role) => (
                      <Badge key={role} tone={roleMeta[role].tone}>
                        {t(roleMeta[role].labelKey)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className={styles.announcementDescription}>{announcement.description}</p>

                <div className={styles.overallRating}>
                  <span className={styles.overallLabel}>{t('DeveloperAnnouncementsPage.overallRating')}</span>
                  {announcement.overallAverageStars === null ? (
                    <span className={styles.noRatings}>{t('DeveloperAnnouncementsPage.noRatingsYet')}</span>
                  ) : (
                    <>
                      <StarRating value={announcement.overallAverageStars} size={18} />
                      <span className={styles.ratingCount}>
                        {announcement.overallAverageStars.toFixed(1)} ·{' '}
                        {t('DeveloperAnnouncementsPage.ratingCount', { count: announcement.overallRatingCount })}
                      </span>
                    </>
                  )}
                </div>

                {announcement.byRole.length > 0 && (
                  <div className={styles.byRole}>
                    <span className={styles.byRoleTitle}>{t('DeveloperAnnouncementsPage.byRoleTitle')}</span>
                    <ul className={styles.byRoleList}>
                      {announcement.byRole.map((roleRating) => (
                        <li key={roleRating.role} className={styles.byRoleRow}>
                          <Badge tone={roleMeta[roleRating.role].tone}>{t(roleMeta[roleRating.role].labelKey)}</Badge>
                          <StarRating value={roleRating.averageStars} size={14} />
                          <span className={styles.byRoleCount}>
                            {roleRating.averageStars.toFixed(1)} ·{' '}
                            {t('DeveloperAnnouncementsPage.ratingCount', { count: roleRating.ratingCount })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

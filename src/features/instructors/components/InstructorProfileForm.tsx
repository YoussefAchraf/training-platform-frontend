import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { FormField } from '@/shared/components/FormField';
import { Textarea } from '@/shared/components/Textarea';
import { Checkbox } from '@/shared/components/Checkbox';
import { Input } from '@/shared/components/Input';
import { ProviderLogo } from '@/shared/components/ProviderLogo';
import { CertificationStatusPill } from '@/shared/components/CertificationStatusPill';
import { AttentionDot } from '@/shared/components/AttentionDot';
import { Tabs, getTabId, getTabPanelId } from '@/shared/components/Tabs';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { Spinner } from '@/shared/components/Spinner';
import { getCertificationExpiryStatus, getWorstCertificationStatus } from '@/shared/utils/certificationExpiry';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { useProviders } from '@/features/providers/hooks/useProviders';
import type { Instructor } from '@/shared/types/domain';
import type { UpdateInstructorPayload } from '../api/instructorsApi';
import styles from './InstructorProfileForm.module.css';

const skillRowSchema = z.object({
  trainingId: z.coerce.number(),
  trainingName: z.string(),
  providerId: z.coerce.number(),
  providerName: z.string(),
  selected: z.boolean(),
  certificateId: z.string().trim().max(120).optional(),
  certificateExpiresAt: z.string().optional(),
});

const profileSchema = z.object({
  bio: z.string().trim().max(2000).optional(),
  skills: z.array(skillRowSchema),
});

type ProfileFormInput = z.input<typeof profileSchema>;
type ProfileFormOutput = z.output<typeof profileSchema>;

const TABS_ID = 'instructor-profile-tabs';
type ProfileTab = 'bio' | 'trainings';

interface InstructorProfileFormProps {
  instructor: Instructor;
  onSubmit: (payload: UpdateInstructorPayload) => void;
  isSubmitting: boolean;
  submitError?: unknown;
  formId?: string;
  submitLabel?: string;
  hideSubmitButton?: boolean;
}

interface SkillRowProps {
  control: Control<ProfileFormInput>;
  index: number;
  trainingName: string;
  providerName: string;
  logoUrl: string | undefined;
  register: ReturnType<typeof useForm<ProfileFormInput, unknown, ProfileFormOutput>>['register'];
}




function SkillRow({ control, index, trainingName, providerName, logoUrl, register }: SkillRowProps) {
  const { t } = useTranslation('instructors');
  const selected = useWatch({ control, name: `skills.${index}.selected` });
  const expiresAt = useWatch({ control, name: `skills.${index}.certificateExpiresAt` });
  const expiryStatus = getCertificationExpiryStatus(expiresAt || null);

  return (
    <div className={styles.skillRow}>
      <div className={styles.skillRowHead}>
        <ProviderLogo name={providerName} logoUrl={logoUrl} size={32} className={styles.providerLogo} />
        <Checkbox
          className={styles.skillCheckbox}
          label={
            <span className={styles.skillLabelBlock}>
              <span className={styles.skillName}>{trainingName}</span>
              {providerName && <span className={styles.skillProvider}>{providerName}</span>}
            </span>
          }
          {...register(`skills.${index}.selected`)}
        />
      </div>
      {selected && (
        <div className={styles.certFields}>
          <label className={styles.certField}>
            <span className={styles.certFieldLabel}>{t('InstructorProfileForm.certificateIdLabel')}</span>
            <Input
              type="text"
              placeholder={t('InstructorProfileForm.certificateIdPlaceholder')}
              {...register(`skills.${index}.certificateId`)}
            />
          </label>
          <label className={styles.certField}>
            <span className={styles.certFieldLabel}>{t('InstructorProfileForm.certificateExpiresLabel')}</span>
            <Input type="date" {...register(`skills.${index}.certificateExpiresAt`)} />
          </label>
          <CertificationStatusPill status={expiryStatus} className={styles.certStatusPill}>
            {expiryStatus === 'expired'
              ? t('InstructorProfileForm.certificateExpired')
              : expiryStatus === 'expiring'
                ? t('InstructorProfileForm.certificateExpiringSoon')
                : t('InstructorProfileForm.certificateOk')}
          </CertificationStatusPill>
        </div>
      )}
    </div>
  );
}

export function InstructorProfileForm({
  instructor,
  onSubmit,
  isSubmitting,
  submitError,
  formId = 'instructor-profile-form',
  submitLabel,
  hideSubmitButton = false,
}: InstructorProfileFormProps) {
  const { t } = useTranslation('instructors');
  const trainingsQuery = useTrainings();
  const providersQuery = useProviders();
  const [activeTab, setActiveTab] = useState<ProfileTab>('bio');

  const providerLogoMap = useMemo(
    () => new Map((providersQuery.data ?? []).map((provider) => [provider.id, provider.logoUrl])),
    [providersQuery.data],
  );

  const skillRows = useMemo(
    () =>
      (trainingsQuery.data ?? []).map((training) => {
        const existing = instructor.skills.find((skill) => skill.trainingId === training.id);
        return {
          trainingId: training.id,
          trainingName: training.name,
          providerId: training.providerId,
          providerName: training.providerName,
          selected: Boolean(existing),
          certificateId: existing?.certificateId ?? '',
          certificateExpiresAt: existing?.certificateExpiresAt ? existing.certificateExpiresAt.slice(0, 10) : '',
        };
      }),
    [trainingsQuery.data, instructor.skills],
  );

  // `values` (not `defaultValues`) re-syncs the form once trainings finish
  // loading - defaultValues is only ever read once, which would freeze
  // `skills` at an empty array if trainingsQuery was still pending on mount.
  const { register, handleSubmit, control } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileSchema),
    values: { bio: instructor.bio ?? '', skills: skillRows },
  });

  const { fields } = useFieldArray({ control, name: 'skills' });
  const selectedCount = skillRows.filter((row) => row.selected).length;
  const hasExpiringCertificate = getWorstCertificationStatus(instructor.skills) !== 'none';

  const submit = handleSubmit((values) => {
    onSubmit({
      bio: values.bio,
      skills: values.skills
        .filter((skill) => skill.selected)
        .map((skill) => ({
          trainingId: skill.trainingId,
          certificateId: skill.certificateId || undefined,
          certificateExpiresAt: skill.certificateExpiresAt || undefined,
        })),
    });
  });

  return (
    <form onSubmit={submit} id={formId} noValidate>
      {Boolean(submitError) && <ErrorBanner error={submitError} />}

      <Tabs
        id={TABS_ID}
        aria-label={t('InstructorProfileForm.tabsLabel')}
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: 'bio', label: t('InstructorProfileForm.bioTab') },
          {
            value: 'trainings',
            label: (
              <>
                {t('InstructorProfileForm.trainingsTab', { count: selectedCount })}
                {hasExpiringCertificate && (
                  <>
                    <AttentionDot className={styles.tabDot} />
                    <span className="visually-hidden">, {t('common:Nav.attentionBadge')}</span>
                  </>
                )}
              </>
            ),
          },
        ]}
      />

      <div
        role="tabpanel"
        id={getTabPanelId(TABS_ID, 'bio')}
        aria-labelledby={getTabId(TABS_ID, 'bio')}
        hidden={activeTab !== 'bio'}
        className={styles.panel}
      >
        <FormField label={t('InstructorProfileForm.bioLabel')} hint={t('InstructorProfileForm.bioHint')}>
          {(fieldProps) => (
            <Textarea placeholder={t('InstructorProfileForm.bioPlaceholder')} {...fieldProps} {...register('bio')} />
          )}
        </FormField>
      </div>

      <div
        role="tabpanel"
        id={getTabPanelId(TABS_ID, 'trainings')}
        aria-labelledby={getTabId(TABS_ID, 'trainings')}
        hidden={activeTab !== 'trainings'}
        className={styles.panel}
      >
        <p className={styles.skillsHint}>{t('InstructorProfileForm.trainingsHint')}</p>
        {trainingsQuery.isPending ? (
          <Spinner size={20} />
        ) : fields.length > 0 ? (
          <div className={styles.skillsList}>
            {fields.map((field, index) => (
              <SkillRow
                key={field.id}
                control={control}
                index={index}
                trainingName={field.trainingName}
                providerName={field.providerName}
                logoUrl={providerLogoMap.get(Number(field.providerId)) ?? undefined}
                register={register}
              />
            ))}
          </div>
        ) : (
          <p className={styles.skillsEmpty}>{t('InstructorProfileForm.noTrainings')}</p>
        )}
      </div>

      {!hideSubmitButton && (
        <Button type="submit" isLoading={isSubmitting} className={styles.submitButton}>
          {submitLabel ?? t('InstructorProfileForm.saveChanges')}
        </Button>
      )}
    </form>
  );
}

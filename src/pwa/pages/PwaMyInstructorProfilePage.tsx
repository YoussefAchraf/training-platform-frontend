import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseQueryResult } from '@tanstack/react-query';
import { ChevronRight, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { Avatar } from '@/shared/components/Avatar';
import { Button } from '@/shared/components/Button';
import { Textarea } from '@/shared/components/Textarea';
import { Spinner } from '@/shared/components/Spinner';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { StatTile } from '@/shared/components/StatTile';
import { ProviderLogo } from '@/shared/components/ProviderLogo';
import { CertificationStatusPill } from '@/shared/components/CertificationStatusPill';
import { AttentionDot } from '@/shared/components/AttentionDot';
import { Checkbox } from '@/shared/components/Checkbox';
import { Tabs, getTabId, getTabPanelId } from '@/shared/components/Tabs';
import { getCertificationExpiryStatus } from '@/shared/utils/certificationExpiry';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { useProviders } from '@/features/providers/hooks/useProviders';
import type { UpdateInstructorPayload } from '@/features/instructors/api/instructorsApi';
import type { Instructor } from '@/shared/types/domain';
import { PwaStatScrollRow } from '../components/PwaStatScrollRow';
import { PwaTrainingCertSheet } from '../components/PwaTrainingCertSheet';
import styles from './PwaMyInstructorProfilePage.module.css';

interface SkillFormRow {
  trainingId: number;
  trainingName: string;
  providerId: number;
  providerName: string;
  selected: boolean;
  certificateId: string;
  certificateExpiresAt: string;
}

interface PwaMyInstructorProfilePageProps {
  profileQuery: UseQueryResult<Instructor>;
  onSubmit: (payload: UpdateInstructorPayload) => void;
  isSubmitting: boolean;
  submitError?: unknown;
}

const TABS_ID = 'pwa-instructor-profile-tabs';
type ProfileTab = 'bio' | 'trainings';









export function PwaMyInstructorProfilePage({ profileQuery, onSubmit, isSubmitting, submitError }: PwaMyInstructorProfilePageProps) {
  const { t } = useTranslation('instructors');
  const trainingsQuery = useTrainings();
  const providersQuery = useProviders();
  const [activeTab, setActiveTab] = useState<ProfileTab>('bio');
  const [bio, setBio] = useState('');
  const [rows, setRows] = useState<SkillFormRow[]>([]);
  const [editingTrainingId, setEditingTrainingId] = useState<number | null>(null);

  const providerLogoMap = useMemo(
    () => new Map((providersQuery.data ?? []).map((provider) => [provider.id, provider.logoUrl])),
    [providersQuery.data],
  );

  useEffect(() => {
    const instructor = profileQuery.data;
    const trainings = trainingsQuery.data;
    if (!instructor || !trainings) return;
    setBio(instructor.bio ?? '');
    setRows(
      trainings.map((training) => {
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
    );
  }, [profileQuery.data, trainingsQuery.data]);

  const selectedCount = rows.filter((row) => row.selected).length;
  const expiringCount = rows.filter(
    (row) => row.selected && getCertificationExpiryStatus(row.certificateExpiresAt || null) !== 'none',
  ).length;
  const hasExpiringCertificate = expiringCount > 0;

  const toggleRow = (trainingId: number) => {
    setRows((current) => current.map((row) => (row.trainingId === trainingId ? { ...row, selected: !row.selected } : row)));
  };

  const editingRow = rows.find((row) => row.trainingId === editingTrainingId) ?? null;

  const handleSheetSave = (certificateId: string, certificateExpiresAt: string) => {
    setRows((current) =>
      current.map((row) => (row.trainingId === editingTrainingId ? { ...row, certificateId, certificateExpiresAt } : row)),
    );
    setEditingTrainingId(null);
  };

  const handleSave = () => {
    onSubmit({
      bio,
      skills: rows
        .filter((row) => row.selected)
        .map((row) => ({
          trainingId: row.trainingId,
          certificateId: row.certificateId || undefined,
          certificateExpiresAt: row.certificateExpiresAt || undefined,
        })),
    });
  };

  if (profileQuery.isPending) return <Spinner />;
  if (profileQuery.isError) return <ErrorBanner error={profileQuery.error} onRetry={() => profileQuery.refetch()} />;
  if (!profileQuery.data) return null;

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <Avatar firstname={profileQuery.data.firstname} lastname={profileQuery.data.lastname} size={64} />
        <p className={styles.name}>
          {profileQuery.data.firstname} {profileQuery.data.lastname}
        </p>
        <p className={styles.email}>{profileQuery.data.email}</p>
      </div>

      <PwaStatScrollRow>
        <StatTile label={t('MyInstructorProfilePage.statQualified')} value={selectedCount} icon={ClipboardCheck} tone="primary" />
        {expiringCount > 0 && (
          <StatTile label={t('MyInstructorProfilePage.statExpiring')} value={expiringCount} icon={AlertTriangle} tone="warning" />
        )}
      </PwaStatScrollRow>

      <Tabs
        id={TABS_ID}
        aria-label={t('InstructorProfileForm.tabsLabel')}
        value={activeTab}
        onChange={setActiveTab}
        variant="pill"
        className={styles.tabs}
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

      {Boolean(submitError) && <ErrorBanner error={submitError} />}

      <div
        role="tabpanel"
        id={getTabPanelId(TABS_ID, 'bio')}
        aria-labelledby={getTabId(TABS_ID, 'bio')}
        hidden={activeTab !== 'bio'}
        className={styles.panel}
      >
        <Textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder={t('InstructorProfileForm.bioPlaceholder')}
          rows={6}
        />
        <p className={styles.hint}>{t('InstructorProfileForm.bioHint')}</p>
      </div>

      <div
        role="tabpanel"
        id={getTabPanelId(TABS_ID, 'trainings')}
        aria-labelledby={getTabId(TABS_ID, 'trainings')}
        hidden={activeTab !== 'trainings'}
        className={styles.panel}
      >
        <p className={styles.hint}>{t('InstructorProfileForm.trainingsHint')}</p>
        {trainingsQuery.isPending ? (
          <Spinner size={20} />
        ) : rows.length > 0 ? (
          <ul className={styles.cardList}>
            {rows.map((row) => {
              const status = getCertificationExpiryStatus(row.certificateExpiresAt || null);
              return (
                <li key={row.trainingId} className={styles.card}>
                  <Checkbox
                    className={styles.cardCheckbox}
                    checked={row.selected}
                    onChange={() => toggleRow(row.trainingId)}
                    label={
                      <span className={styles.cardText}>
                        <ProviderLogo name={row.providerName} logoUrl={providerLogoMap.get(row.providerId) ?? undefined} size={36} />
                        <span className={styles.cardLabelBlock}>
                          <span className={styles.cardName}>{row.trainingName}</span>
                          {row.providerName && <span className={styles.cardProvider}>{row.providerName}</span>}
                        </span>
                      </span>
                    }
                  />
                  {row.selected && (
                    <button type="button" className={styles.cardCertRow} onClick={() => setEditingTrainingId(row.trainingId)}>
                      <CertificationStatusPill status={status}>
                        {status === 'expired'
                          ? t('InstructorProfileForm.certificateExpired')
                          : status === 'expiring'
                            ? t('InstructorProfileForm.certificateExpiringSoon')
                            : row.certificateId || t('InstructorProfileForm.certificateOk')}
                      </CertificationStatusPill>
                      <ChevronRight size={16} className={styles.cardChevron} aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.hint}>{t('InstructorProfileForm.noTrainings')}</p>
        )}
      </div>

      <Button className={styles.saveButton} isLoading={isSubmitting} onClick={handleSave}>
        {t('InstructorProfileForm.saveChanges')}
      </Button>

      <PwaTrainingCertSheet
        isOpen={editingRow !== null}
        trainingName={editingRow?.trainingName ?? ''}
        certificateId={editingRow?.certificateId ?? ''}
        certificateExpiresAt={editingRow?.certificateExpiresAt ?? ''}
        onClose={() => setEditingTrainingId(null)}
        onSave={handleSheetSave}
      />
    </div>
  );
}

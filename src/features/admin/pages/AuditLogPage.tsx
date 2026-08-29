import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, History } from 'lucide-react';
import { PageHeader } from '@/shared/components/PageHeader';
import { Select } from '@/shared/components/Select';
import { Input } from '@/shared/components/Input';
import { Badge } from '@/shared/components/Badge';
import { ErrorBanner } from '@/shared/components/ErrorBanner';
import { EmptyState } from '@/shared/components/EmptyState';
import { Skeleton } from '@/shared/components/Skeleton';
import { useAuditLog } from '../hooks/useAuditLog';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/shared/utils/formatDate';
import { getAuditActionMeta, roleMeta } from '@/shared/utils/statusMeta';
import { staggerContainer, listItem } from '@/shared/motion/variants';
import { roleNameOf } from '@/shared/types/domain';
import type { AuditEntityType, AuditLogEntry, Role } from '@/shared/types/domain';
import type { TFunction } from 'i18next';
import styles from './AuditLogPage.module.css';

const ENTITY_TYPES: AuditEntityType[] = ['Provider', 'Training', 'Client', 'Session', 'User'];
const FILTERABLE_ROLES: Role[] = ['Sales', 'Manager', 'Instructor', 'SuperAdmin'];




function entityTypeOptionsFor(isSuperAdmin: boolean): AuditEntityType[] {
  return isSuperAdmin ? ENTITY_TYPES : ENTITY_TYPES.filter((type) => type !== 'User');
}

const ISO_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;




const KNOWN_FIELD_KEYS = new Set([
  'name', 'description', 'logoUrl', 'companyName', 'email', 'phone', 'providerId', 'providerName',
  'duration', 'firstname', 'lastname', 'roleId', 'status', 'startDate', 'endDate', 'trainingId',
  'clientId', 'instructorId', 'sessionStatus', 'assignmentStatus', 'createdBy', 'creatorName',
]);

function labelFor(key: string, t: TFunction<'admin'>): string {
  if (KNOWN_FIELD_KEYS.has(key)) return t(`AuditLogPage.fields.${key}`);
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
}





function formatValue(key: string, value: unknown, t: TFunction<'admin'>): string {
  if (value === null || value === undefined || value === '') return '—';
  if (key === 'roleId' && typeof value === 'number') {
    return roleNameOf({ roleId: value }) ?? `Role #${value}`;
  }
  if (typeof value === 'boolean') return value ? t('AuditLogPage.yes') : t('AuditLogPage.no');
  if (typeof value === 'string' && ISO_DATETIME_RE.test(value)) return formatDateTime(value);
  return String(value);
}

interface ChangeRow {
  key: string;
  from: unknown;
  to: unknown;
}

// Some entities carry both a raw FK and its resolved name as separate
// sibling fields (createdBy+creatorName, providerId+providerName) - when
// the resolved name field is present, the raw id row is redundant (and on
// a `create` entry, where every field in `after` trivially counts as
// "changed" since `before` is empty, it would otherwise always show up
// right next to the resolved version). Skip the raw key whenever its named
// counterpart exists in the same snapshot.
const ID_FIELDS_WITH_NAME_PAIR: Record<string, string> = {
  createdBy: 'creatorName',
  providerId: 'providerName',
};

// before/after are always full, symmetric, flat entity snapshots (confirmed
// across every use-case that writes an audit entry) - so a plain key-by-key
// equality check is a correct diff here, no schema-aware diffing needed.
function getChanges(entry: AuditLogEntry): ChangeRow[] {
  const before = (entry.before ?? {}) as Record<string, unknown>;
  const after = (entry.after ?? {}) as Record<string, unknown>;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const rows: ChangeRow[] = [];
  for (const key of keys) {
    if (key === 'id' || key === 'createdAt') continue;
    const namePair = ID_FIELDS_WITH_NAME_PAIR[key];
    if (namePair && keys.has(namePair)) continue;
    const from = before[key];
    const to = after[key];
    if (JSON.stringify(from) === JSON.stringify(to)) continue;
    rows.push({ key, from, to });
  }
  return rows;
}

// Session has no name-bearing field of its own (just FK ids + dates) - falls
// back to a formatted date instead of a raw "Session #12".
function getEntityLabel(entry: AuditLogEntry, t: TFunction<'admin'>): string {
  const snapshot = (entry.after ?? entry.before) as Record<string, unknown> | null;
  if (snapshot) {
    if (typeof snapshot.name === 'string' && snapshot.name) return snapshot.name;
    if (typeof snapshot.companyName === 'string' && snapshot.companyName) return snapshot.companyName;
    if (typeof snapshot.firstname === 'string' && typeof snapshot.lastname === 'string') {
      return `${snapshot.firstname} ${snapshot.lastname}`;
    }
    if (typeof snapshot.startDate === 'string') {
      return t('AuditLogPage.sessionOn', { date: formatDateTime(snapshot.startDate) });
    }
  }
  return t('AuditLogPage.entityLabel', { type: entry.entityType, id: entry.entityId });
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
  const { t } = useTranslation('admin');
  const [expanded, setExpanded] = useState(false);
  const changes = getChanges(entry);
  const hasChanges = changes.length > 0;
  const actionMeta = getAuditActionMeta(entry.action);
  // actorName now comes straight from the API (a JOIN, not a client-side
  // lookup) - fixes Managers previously always seeing "User #N" here, since
  // that used to depend on a SuperAdmin-only /admin/users fetch.
  const actorName = entry.actorName ?? (entry.actorId === null ? t('AuditLogPage.system') : t('AuditLogPage.user', { id: entry.actorId }));
  const isCreate = !entry.before;

  return (
    <motion.li variants={listItem} className={styles.row}>
      <div className={styles.rowHeader}>
        <Badge tone={actionMeta.tone}>{t(actionMeta.labelKey)}</Badge>
        <span className={styles.entity}>
          {t(`AuditLogPage.entityTypes.${entry.entityType}`)}: {getEntityLabel(entry, t)}
        </span>
        <span className={styles.actor}>{t('AuditLogPage.by', { name: actorName })}</span>
        <span className={styles.timestamp}>{formatDateTime(entry.createdAt)}</span>
        {hasChanges && (
          <button
            type="button"
            className={styles.toggle}
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {t('AuditLogPage.viewChanges')}
            <ChevronDown size={14} className={expanded ? styles.toggleIconOpen : undefined} />
          </button>
        )}
      </div>

      {expanded && hasChanges && (
        <ul className={styles.changeList}>
          {changes.map(({ key, from, to }) => (
            <li key={key} className={styles.changeRow}>
              <span className={styles.changeLabel}>{labelFor(key, t)}</span>
              {isCreate ? (
                <span className={styles.changeTo}>{formatValue(key, to, t)}</span>
              ) : (
                <span className={styles.changeValue}>
                  <span className={styles.changeFrom}>{formatValue(key, from, t)}</span>
                  <ArrowRight size={12} />
                  <span className={styles.changeTo}>{formatValue(key, to, t)}</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.li>
  );
}

export function AuditLogPage() {
  const { t } = useTranslation('admin');
  const { isSuperAdmin } = useAuth();
  const [entityType, setEntityType] = useState<string>('');
  const [entityId, setEntityId] = useState<string>('');
  const [roleName, setRoleName] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const entityTypeOptions = entityTypeOptionsFor(isSuperAdmin);

  const auditQuery = useAuditLog({
    entityType: entityType ? (entityType as AuditEntityType) : undefined,
    entityId: entityId ? Number(entityId) : undefined,
    roleName: roleName ? (roleName as Role) : undefined,
    startDate: startDate ? new Date(startDate).toISOString() : undefined,
    endDate: endDate ? new Date(endDate).toISOString() : undefined,
  });

  return (
    <div>
      <PageHeader title={t('AuditLogPage.title')} description={t('AuditLogPage.description')} />

      <div className={styles.filters}>
        <Select value={entityType} onChange={(event) => setEntityType(event.target.value)} aria-label={t('AuditLogPage.filterEntityType')}>
          <option value="">{t('AuditLogPage.allEntityTypes')}</option>
          {entityTypeOptions.map((type) => (
            <option key={type} value={type}>
              {t(`AuditLogPage.entityTypes.${type}`)}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          placeholder={t('AuditLogPage.entityIdPlaceholder')}
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
          aria-label={t('AuditLogPage.filterEntityId')}
        />
        <Select value={roleName} onChange={(event) => setRoleName(event.target.value)} aria-label={t('AuditLogPage.filterActorRole')}>
          <option value="">{t('AuditLogPage.allRoles')}</option>
          {FILTERABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {t(roleMeta[role].labelKey)}
            </option>
          ))}
        </Select>
        <Input
          type="datetime-local"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
          aria-label={t('AuditLogPage.fromDate')}
        />
        <Input
          type="datetime-local"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          aria-label={t('AuditLogPage.toDate')}
        />
      </div>

      {auditQuery.isError ? (
        <ErrorBanner error={auditQuery.error} onRetry={() => auditQuery.refetch()} />
      ) : auditQuery.isPending ? (
        <div className={styles.skeletonList}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} height={56} radius="var(--radius-md)" />
          ))}
        </div>
      ) : (auditQuery.data ?? []).length === 0 ? (
        <EmptyState icon={History} title={t('AuditLogPage.noEntries')} description={t('AuditLogPage.noEntriesDescription')} />
      ) : (
        <motion.ul className={styles.list} variants={staggerContainer(0.03)} initial="hidden" animate="show">
          {(auditQuery.data ?? []).map((entry) => (
            <AuditLogRow key={entry.id} entry={entry} />
          ))}
        </motion.ul>
      )}
    </div>
  );
}

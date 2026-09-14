



export const CERTIFICATION_EXPIRY_WARNING_DAYS = 30;

export type CertificationExpiryStatus = 'none' | 'expiring' | 'expired';

export function getCertificationExpiryStatus(
  certificateExpiresAt: string | null | undefined,
  warningDays: number = CERTIFICATION_EXPIRY_WARNING_DAYS,
): CertificationExpiryStatus {
  if (!certificateExpiresAt) return 'none';
  const expiresAt = new Date(certificateExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) return 'none';

  const now = Date.now();
  if (expiresAt <= now) return 'expired';
  if (expiresAt - now <= warningDays * 24 * 60 * 60 * 1000) return 'expiring';
  return 'none';
}

const STATUS_SEVERITY: Record<CertificationExpiryStatus, number> = { none: 0, expiring: 1, expired: 2 };





export function getWorstCertificationStatus(
  skills: Array<{ certificateExpiresAt: string | null | undefined }>,
): CertificationExpiryStatus {
  let worst: CertificationExpiryStatus = 'none';
  for (const skill of skills) {
    const status = getCertificationExpiryStatus(skill.certificateExpiresAt);
    if (STATUS_SEVERITY[status] > STATUS_SEVERITY[worst]) worst = status;
  }
  return worst;
}

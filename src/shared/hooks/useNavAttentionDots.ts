import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMyInstructorProfile, useInstructors } from '@/features/instructors/hooks/useInstructors';
import { getWorstCertificationStatus } from '@/shared/utils/certificationExpiry';
import { paths } from '@/routes/paths';







export function useNavAttentionDots(): Record<string, boolean> {
  const { isInstructor, canManageCatalog } = useAuth();
  const myProfileQuery = useMyInstructorProfile({ enabled: isInstructor });
  const instructorsQuery = useInstructors({ enabled: canManageCatalog });

  const dots: Record<string, boolean> = {};

  if (isInstructor) {
    dots[paths.myInstructorProfile] = getWorstCertificationStatus(myProfileQuery.data?.skills ?? []) !== 'none';
  }

  if (canManageCatalog) {
    dots[paths.instructors] =
      getWorstCertificationStatus((instructorsQuery.data ?? []).flatMap((instructor) => instructor.skills)) !== 'none';
  }

  return dots;
}

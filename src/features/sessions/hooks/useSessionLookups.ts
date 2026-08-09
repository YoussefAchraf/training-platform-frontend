import { useMemo } from 'react';
import { useTrainings } from '@/features/trainings/hooks/useTrainings';
import { useClients } from '@/features/clients/hooks/useClients';
import { useInstructors } from '@/features/instructors/hooks/useInstructors';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useSessionLookups() {
  const { canManageCatalog } = useAuth();
  const trainingsQuery = useTrainings();
  const clientsQuery = useClients();
  const instructorsQuery = useInstructors({ enabled: canManageCatalog });

  const trainingMap = useMemo(
    () => new Map((trainingsQuery.data ?? []).map((training) => [training.id, training])),
    [trainingsQuery.data],
  );
  const clientMap = useMemo(
    () => new Map((clientsQuery.data ?? []).map((client) => [client.id, client])),
    [clientsQuery.data],
  );
  const instructorMap = useMemo(
    () => new Map((instructorsQuery.data ?? []).map((instructor) => [instructor.id, instructor])),
    [instructorsQuery.data],
  );

  return {
    trainingMap,
    clientMap,
    instructorMap,
    instructors: instructorsQuery.data ?? [],
    isLoading:
      trainingsQuery.isPending || clientsQuery.isPending || (canManageCatalog && instructorsQuery.isPending),
  };
}

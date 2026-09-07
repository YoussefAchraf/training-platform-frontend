import type { Instructor } from '@/shared/types/domain';

export interface InstructorFilters {
  search: string;
  trainingId: number | 'all';
}

export const defaultInstructorFilters: InstructorFilters = {
  search: '',
  trainingId: 'all',
};

export function hasActiveInstructorFilters(filters: InstructorFilters): boolean {
  return filters.search.trim() !== '' || filters.trainingId !== 'all';
}



export function filterInstructors(instructors: Instructor[], filters: InstructorFilters): Instructor[] {
  const search = filters.search.trim().toLowerCase();

  return instructors.filter((instructor) => {
    if (filters.trainingId !== 'all' && !instructor.skills.some((skill) => skill.trainingId === filters.trainingId)) {
      return false;
    }

    if (search) {
      const haystack = `${instructor.firstname} ${instructor.lastname} ${instructor.email}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }

    return true;
  });
}

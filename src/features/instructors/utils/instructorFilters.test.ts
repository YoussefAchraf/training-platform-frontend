import { describe, expect, it } from 'vitest';
import type { Instructor } from '@/shared/types/domain';
import { defaultInstructorFilters, filterInstructors, hasActiveInstructorFilters } from './instructorFilters';

function makeInstructor(overrides: Partial<Instructor> = {}): Instructor {
  return {
    id: 1,
    userId: 1,
    bio: null,
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane@example.com',
    skills: [],
    ...overrides,
  };
}

describe('filterInstructors', () => {
  it('returns every instructor when no filters are active', () => {
    const instructors = [makeInstructor({ id: 1 }), makeInstructor({ id: 2 })];
    expect(filterInstructors(instructors, defaultInstructorFilters)).toHaveLength(2);
  });

  it('filters by training id (skills)', () => {
    const instructors = [
      makeInstructor({ id: 1, skills: [{ trainingId: 10, trainingName: 'RHCE' }] }),
      makeInstructor({ id: 2, skills: [{ trainingId: 20, trainingName: 'CompTIA' }] }),
    ];
    const result = filterInstructors(instructors, { ...defaultInstructorFilters, trainingId: 10 });
    expect(result.map((i) => i.id)).toEqual([1]);
  });

  it('excludes instructors with no matching skill', () => {
    const instructors = [makeInstructor({ id: 1, skills: [] })];
    expect(filterInstructors(instructors, { ...defaultInstructorFilters, trainingId: 10 })).toEqual([]);
  });

  it('searches first name, last name, and email case-insensitively', () => {
    const instructors = [
      makeInstructor({ id: 1, firstname: 'Jane', lastname: 'Doe', email: 'jane@example.com' }),
      makeInstructor({ id: 2, firstname: 'Bob', lastname: 'Smith', email: 'bob@example.com' }),
    ];
    expect(filterInstructors(instructors, { ...defaultInstructorFilters, search: 'jane' }).map((i) => i.id)).toEqual([1]);
    expect(filterInstructors(instructors, { ...defaultInstructorFilters, search: 'SMITH' }).map((i) => i.id)).toEqual([2]);
    expect(filterInstructors(instructors, { ...defaultInstructorFilters, search: 'bob@example.com' }).map((i) => i.id)).toEqual([2]);
  });

  it('combines search and training filter with AND semantics', () => {
    const instructors = [
      makeInstructor({ id: 1, firstname: 'Jane', skills: [{ trainingId: 10, trainingName: 'RHCE' }] }),
      makeInstructor({ id: 2, firstname: 'Jane', skills: [{ trainingId: 20, trainingName: 'CompTIA' }] }),
    ];
    const result = filterInstructors(instructors, { ...defaultInstructorFilters, search: 'jane', trainingId: 10 });
    expect(result.map((i) => i.id)).toEqual([1]);
  });

  it('returns an empty array when nothing matches', () => {
    const instructors = [makeInstructor({ id: 1 })];
    expect(filterInstructors(instructors, { ...defaultInstructorFilters, search: 'nonexistent' })).toEqual([]);
  });
});

describe('hasActiveInstructorFilters', () => {
  it('is false for the default filters', () => {
    expect(hasActiveInstructorFilters(defaultInstructorFilters)).toBe(false);
  });

  it('is true when search has non-whitespace text', () => {
    expect(hasActiveInstructorFilters({ ...defaultInstructorFilters, search: 'jane' })).toBe(true);
  });

  it('is false when search is only whitespace', () => {
    expect(hasActiveInstructorFilters({ ...defaultInstructorFilters, search: '   ' })).toBe(false);
  });

  it('is true when the training filter is non-default', () => {
    expect(hasActiveInstructorFilters({ ...defaultInstructorFilters, trainingId: 10 })).toBe(true);
  });
});

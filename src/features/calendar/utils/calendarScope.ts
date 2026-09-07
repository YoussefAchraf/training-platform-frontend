







export function sessionIdsByCreator<T extends { id: number; createdBy: number | null }>(
  sessions: T[],
  userId: number,
): Set<number> {
  return new Set(sessions.filter((session) => session.createdBy === userId).map((session) => session.id));
}

export function sessionIdsByInstructor<T extends { id: number; instructorId: number | null }>(
  sessions: T[],
  instructorId: number,
): Set<number> {
  return new Set(sessions.filter((session) => session.instructorId === instructorId).map((session) => session.id));
}

import type { DriveStep } from 'driver.js';

export type Side = 'top' | 'right' | 'bottom' | 'left';

export function step(element: string | undefined, title: string, text: string, side: Side = 'bottom'): DriveStep {
  return { element, popover: { title, description: text, side, align: 'start' } };
}

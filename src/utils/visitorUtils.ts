import { VisitorPass, VisitorStatus } from '../types/visitor';

/**
 * Derives real-time pass status taking into account expected departure time.
 * Replaces the delayed periodic interval check with instant reactive evaluation.
 */
export function getDerivedPassStatus(pass: VisitorPass): VisitorStatus {
  if (pass.status === 'CHECKED_OUT') {
    return 'CHECKED_OUT';
  }
  if (pass.expectedDepartureTime) {
    const expTime = new Date(pass.expectedDepartureTime).getTime();
    if (!isNaN(expTime) && Date.now() > expTime) {
      return 'OVERDUE';
    }
  }
  return 'ON_SITE';
}

import { describe, expect, it } from 'vitest';
import { toClientPayload } from './clientPayload';

describe('toClientPayload', () => {
  it('omits an empty country so the database country check is never asked to accept an empty string', () => {
    const payload = toClientPayload({ companyName: 'Acme', email: '', phone: '', country: '' });

    expect(payload.country).toBeUndefined();
    expect('country' in JSON.parse(JSON.stringify(payload))).toBe(false);
  });

  it('omits empty email and phone as well', () => {
    const payload = toClientPayload({ companyName: 'Acme', email: '', phone: '', country: 'TN' });

    expect(JSON.parse(JSON.stringify(payload))).toEqual({ companyName: 'Acme', country: 'TN' });
  });

  it('omits fields that were never filled in', () => {
    const payload = toClientPayload({ companyName: 'Acme' });

    expect(JSON.parse(JSON.stringify(payload))).toEqual({ companyName: 'Acme' });
  });

  it('keeps every value that was provided', () => {
    const payload = toClientPayload({
      companyName: 'Acme',
      email: 'contact@acme.tn',
      phone: '+21671000000',
      country: 'TN',
    });

    expect(payload).toEqual({
      companyName: 'Acme',
      email: 'contact@acme.tn',
      phone: '+21671000000',
      country: 'TN',
    });
  });

  it('trims surrounding whitespace and drops values that are only whitespace', () => {
    const payload = toClientPayload({ companyName: '  Acme  ', email: '   ', phone: ' +21671000000 ', country: ' ' });

    expect(JSON.parse(JSON.stringify(payload))).toEqual({ companyName: 'Acme', phone: '+21671000000' });
  });
});

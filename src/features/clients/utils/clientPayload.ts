import type { CreateClientPayload } from '../api/clientsApi';

interface ClientFormFields {
  companyName: string;
  email?: string;
  phone?: string;
  country?: string;
}

export function toClientPayload(values: ClientFormFields): CreateClientPayload {
  return {
    companyName: values.companyName.trim(),
    email: values.email?.trim() || undefined,
    phone: values.phone?.trim() || undefined,
    country: values.country?.trim() || undefined,
  };
}

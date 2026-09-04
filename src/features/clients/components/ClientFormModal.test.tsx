import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { clientsApi } from '../api/clientsApi';
import { ClientFormModal } from './ClientFormModal';

vi.mock('../api/clientsApi', () => ({
  clientsApi: { create: vi.fn(), update: vi.fn() },
}));

const mockedClientsApi = vi.mocked(clientsApi);

function renderModal(props: Partial<React.ComponentProps<typeof ClientFormModal>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <ClientFormModal isOpen onClose={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

async function pickCountry(user: ReturnType<typeof userEvent.setup>, countryName: string) {
  const countryInput = screen.getByPlaceholderText('Tunisia');
  await user.click(countryInput);
  await user.clear(countryInput);
  await user.type(countryInput, countryName);
  await user.click(await screen.findByRole('option', { name: countryName }));
}

describe('ClientFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('leaves phone as plain free text when no country is picked', async () => {
    renderModal();

    const phoneInput = screen.getByPlaceholderText('+1 555 000 1234');
    expect(phoneInput).toBeInTheDocument();
    
    expect(screen.queryByText('+216')).not.toBeInTheDocument();
  });

  it('shows a calling-code prefix once a country is picked', async () => {
    const user = userEvent.setup();
    renderModal();

    await pickCountry(user, 'Tunisia');

    expect(screen.getByText('+216')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('20 123 456')).toBeInTheDocument();
  });

  it('rejects a phone number that is not valid for the picked country', async () => {
    const user = userEvent.setup();
    renderModal();

    await pickCountry(user, 'Tunisia');
    await user.type(screen.getByPlaceholderText('20 123 456'), '123');
    await user.type(screen.getByPlaceholderText('Acme Corp'), 'Acme');
    await user.click(screen.getByRole('button', { name: /add client/i }));

    expect(await screen.findByText(/valid phone number/i)).toBeInTheDocument();
    expect(mockedClientsApi.create).not.toHaveBeenCalled();
  });

  it('submits a valid phone number as a clean E.164 string', async () => {
    const user = userEvent.setup();
    mockedClientsApi.create.mockResolvedValue({
      id: 1,
      companyName: 'Acme',
      email: null,
      phone: '+21620123456',
      country: 'TN',
      createdBy: 1,
      creatorName: 'Someone',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    renderModal();

    await user.type(screen.getByPlaceholderText('Acme Corp'), 'Acme');
    await pickCountry(user, 'Tunisia');
    await user.type(screen.getByPlaceholderText('20 123 456'), '20123456');
    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() =>
      expect(mockedClientsApi.create.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ country: 'TN', phone: '+21620123456' }),
      ),
    );
  });

  it('clears the phone number when the country is changed', async () => {
    const user = userEvent.setup();
    renderModal();

    await pickCountry(user, 'Tunisia');
    const phoneInput = screen.getByPlaceholderText('20 123 456');
    await user.type(phoneInput, '20123456');
    await waitFor(() => expect(phoneInput).toHaveValue('20 123 456'));

    await pickCountry(user, 'France');

    
    
    expect(screen.getByPlaceholderText('20 123 456')).toHaveValue('');
    expect(screen.getByText('+33')).toBeInTheDocument();
  });

  it('allows a client to be saved with no country or phone at all (backward compatible)', async () => {
    const user = userEvent.setup();
    mockedClientsApi.create.mockResolvedValue({
      id: 2,
      companyName: 'Acme',
      email: null,
      phone: null,
      country: null,
      createdBy: 1,
      creatorName: 'Someone',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    renderModal();

    await user.type(screen.getByPlaceholderText('Acme Corp'), 'Acme');
    await user.click(screen.getByRole('button', { name: /add client/i }));

    await waitFor(() => expect(mockedClientsApi.create).toHaveBeenCalled());
  });
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Provider } from '@/shared/types/domain';
import { providersApi } from '@/features/providers/api/providersApi';
import { trainingsApi } from '../api/trainingsApi';
import { TrainingFormModal } from './TrainingFormModal';

vi.mock('@/features/providers/api/providersApi', () => ({
  providersApi: { list: vi.fn() },
}));
vi.mock('../api/trainingsApi', () => ({
  trainingsApi: { create: vi.fn(), update: vi.fn() },
}));

const mockedProvidersApi = vi.mocked(providersApi);
const mockedTrainingsApi = vi.mocked(trainingsApi);

const redHat: Provider = {
  id: 1,
  name: 'Red Hat',
  description: null,
  logoUrl: null,
  createdBy: 1,
  creatorName: 'Someone',
  createdAt: '2026-01-01T00:00:00.000Z',
};
const aws: Provider = { ...redHat, id: 2, name: 'AWS (Amazon Web Services)' };




function renderModal(props: Partial<React.ComponentProps<typeof TrainingFormModal>> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TrainingFormModal isOpen onClose={vi.fn()} {...props} />
    </QueryClientProvider>,
  );
}

async function getLoadedProviderSelect() {
  await waitFor(() => expect(screen.getByRole('option', { name: 'Red Hat' })).toBeInTheDocument());
  return screen.getByLabelText(/^provider/i) as HTMLSelectElement;
}

async function pickFromCombobox(user: ReturnType<typeof userEvent.setup>, input: HTMLElement, optionText: string) {
  await user.click(input);
  await user.type(input, optionText);
  const option = await screen.findByRole('option', { name: new RegExp(optionText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') });
  await user.click(option);
}

describe('TrainingFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedProvidersApi.list.mockResolvedValue([redHat, aws]);
  });

  it('locks duration and description until a provider is known', async () => {
    renderModal();

    await waitFor(() => expect(screen.getByRole('option', { name: 'Red Hat' })).toBeInTheDocument());
    expect(screen.getByPlaceholderText('40')).toBeDisabled();
    expect(screen.getByPlaceholderText('Red Hat Certified System Administrator')).toBeDisabled();
  });

  it('unlocks duration and description once a provider is picked directly', async () => {
    const user = userEvent.setup();
    renderModal();

    const providerSelect = await getLoadedProviderSelect();
    await user.selectOptions(providerSelect, 'Red Hat');

    expect(screen.getByPlaceholderText('40')).toBeEnabled();
    expect(screen.getByPlaceholderText('Red Hat Certified System Administrator')).toBeEnabled();
  });

  it('fills in the description when a catalog training is picked under an already-selected provider', async () => {
    const user = userEvent.setup();
    renderModal();

    const providerSelect = await getLoadedProviderSelect();
    await user.selectOptions(providerSelect, 'Red Hat');

    const nameInput = screen.getByPlaceholderText('RHCSA');
    await pickFromCombobox(user, nameInput, 'RH124');

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Red Hat Certified System Administrator')).toHaveValue(
        'Core command-line administration of Red Hat Enterprise Linux systems.',
      ),
    );
  });

  it('auto-selects the matching provider when a training is picked before any provider', async () => {
    const user = userEvent.setup();
    renderModal();

    const nameInput = await screen.findByPlaceholderText('RHCSA');
    await pickFromCombobox(user, nameInput, 'AWS Certified Cloud Practitioner');

    const providerSelect = screen.getByLabelText(/^provider/i) as HTMLSelectElement;
    await waitFor(() => expect(providerSelect).toHaveValue(String(aws.id)));
    expect(screen.getByPlaceholderText('40')).toBeEnabled();
  });

  it('shows a hint instead of auto-selecting when the training\'s provider has not been added yet', async () => {
    const user = userEvent.setup();
    renderModal();

    const nameInput = await screen.findByPlaceholderText('RHCSA');
    await pickFromCombobox(user, nameInput, 'CCNA');

    expect(await screen.findByText(/Cisco.*isn't in your providers list yet/i)).toBeInTheDocument();
    const providerSelect = screen.getByLabelText(/^provider/i) as HTMLSelectElement;
    expect(providerSelect).toHaveValue('');
    expect(screen.getByPlaceholderText('40')).toBeDisabled();
  });

  it('clears name and description when the provider is changed', async () => {
    const user = userEvent.setup();
    renderModal();

    const providerSelect = await getLoadedProviderSelect();
    await user.selectOptions(providerSelect, 'Red Hat');
    const nameInput = screen.getByPlaceholderText('RHCSA');
    await pickFromCombobox(user, nameInput, 'RH124');
    await waitFor(() => expect(nameInput).toHaveValue('RH124 – Red Hat System Administration I'));

    await user.selectOptions(providerSelect, 'AWS (Amazon Web Services)');

    expect(nameInput).toHaveValue('');
    expect(screen.getByPlaceholderText('Red Hat Certified System Administrator')).toHaveValue('');
  });

  it('submits a free-typed training name that is not in the catalog', async () => {
    const user = userEvent.setup();
    mockedTrainingsApi.create.mockResolvedValue({
      id: 9,
      name: 'A Custom Internal Workshop',
      providerId: redHat.id,
      providerName: redHat.name,
      description: null,
      duration: null,
      durationUnit: null,
      createdBy: 1,
      creatorName: 'Someone',
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    renderModal();

    const providerSelect = await getLoadedProviderSelect();
    await user.selectOptions(providerSelect, 'Red Hat');
    const nameInput = screen.getByPlaceholderText('RHCSA');
    await user.type(nameInput, 'A Custom Internal Workshop');
    await user.click(screen.getByRole('button', { name: /add training/i }));

    await waitFor(() =>
      expect(mockedTrainingsApi.create.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({ name: 'A Custom Internal Workshop', providerId: redHat.id }),
      ),
    );
  });
});

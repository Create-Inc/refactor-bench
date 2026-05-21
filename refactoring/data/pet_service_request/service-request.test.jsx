import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ---- Mocks ----

// expo-router
const mockRouter = { push: vi.fn(), back: vi.fn() };
vi.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ serviceType: currentServiceType }),
}));
let currentServiceType = 'hospedaje';

// auth
vi.mock('@/utils/auth/useAuth', () => ({
  useAuth: () => ({ auth: { user: { id: 'user-1' } } }),
}));

// theme
vi.mock('@/components/AppTheme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#fff',
      text: '#000',
      primary: '#4F46E5',
      card: '#f9f9f9',
    },
    isDark: false,
  }),
}));

// fonts
vi.mock('@expo-google-fonts/sora', () => ({
  useFonts: () => [true],
  Sora_400Regular: 'Sora_400Regular',
  Sora_600SemiBold: 'Sora_600SemiBold',
  Sora_800ExtraBold: 'Sora_800ExtraBold',
}));

// Alert
const mockAlert = vi.fn();
vi.mock('react-native', async () => {
  const rn = await vi.importActual('react-native');
  return {
    ...rn,
    Alert: { alert: (...args) => mockAlert(...args) },
  };
});

// react-query
const mockMutate = vi.fn();
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }) => {
    if (queryKey[0] === 'pets') {
      return {
        data: {
          pets: [
            { id: 'pet-1', name: 'Firulais' },
            { id: 'pet-2', name: 'Pelusa' },
          ],
        },
      };
    }
    if (queryKey[0] === 'service-pricing') {
      return {
        data: {
          pricing: [
            {
              pet_size: 'mediano',
              base_price: 50,
              description: 'Servicio estándar',
            },
            {
              pet_size: 'grande',
              base_price: 80,
              description: 'Servicio grande',
            },
          ],
        },
      };
    }
    return { data: null };
  },
}));

// useServiceRequest
vi.mock('@/hooks/useServiceRequest', () => ({
  useServiceRequest: () => ({
    createRequest: { mutate: mockMutate, isPending: false },
    openWhatsApp: vi.fn(),
    openPhone: vi.fn(),
  }),
}));

// Grooming form mock
const mockGroomingForm = {
  groomingSize: 'mediano',
  groomingClientName: '',
  groomingPetName: '',
  groomingBreed: '',
  petSex: '',
  petAge: '',
  groomingColor: '',
  petImage: '',
  groomingAddress: '',
  vaccineUpToDate: false,
  serviceLocation: '',
  setGroomingSize: vi.fn(),
  setGroomingClientName: vi.fn(),
  setGroomingPetName: vi.fn(),
  setGroomingBreed: vi.fn(),
  setPetSex: vi.fn(),
  setPetAge: vi.fn(),
  setGroomingColor: vi.fn(),
  setPetImage: vi.fn(),
  setGroomingAddress: vi.fn(),
  setVaccineUpToDate: vi.fn(),
  setServiceLocation: vi.fn(),
  isFormComplete: vi.fn(() => false),
};
vi.mock('@/hooks/useGroomingForm', () => ({
  useGroomingForm: () => mockGroomingForm,
}));

// Funeral form mock
const mockFuneralForm = {
  ownerFullName: '',
  ownerIdDocument: '',
  ownerAddress: '',
  ownerEmail: '',
  petName: '',
  petSpecies: '',
  petBreed: '',
  petWeight: '',
  petColor: '',
  paymentMethod: '',
  setOwnerFullName: vi.fn(),
  setOwnerIdDocument: vi.fn(),
  setOwnerAddress: vi.fn(),
  setOwnerEmail: vi.fn(),
  setPetName: vi.fn(),
  setPetSpecies: vi.fn(),
  setPetBreed: vi.fn(),
  setPetWeight: vi.fn(),
  setPetColor: vi.fn(),
  setPaymentMethod: vi.fn(),
  isFormComplete: vi.fn(() => false),
};
vi.mock('@/hooks/useFuneralForm', () => ({
  useFuneralForm: () => mockFuneralForm,
}));

// Walker form mock
const mockWalkerForm = {
  walkerDogName: '',
  walkerDogBreed: '',
  walkerDogAge: '',
  walkerDogWeight: '',
  walkerPhone: '',
  walkerAddress: '',
  walkerRequirements: '',
  setWalkerDogName: vi.fn(),
  setWalkerDogBreed: vi.fn(),
  setWalkerDogAge: vi.fn(),
  setWalkerDogWeight: vi.fn(),
  setWalkerPhone: vi.fn(),
  setWalkerAddress: vi.fn(),
  setWalkerRequirements: vi.fn(),
  isFormComplete: vi.fn(() => false),
};
vi.mock('@/hooks/useWalkerForm', () => ({
  useWalkerForm: () => mockWalkerForm,
}));

// Utility mocks
vi.mock('@/utils/serviceRequestUtils', () => ({
  generateDates: () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  },
  calculateTotal: (price, days) =>
    price ? price.base_price * parseInt(days || '1') : 0,
  SERVICE_NAMES: {
    hospedaje: 'Hospedaje',
    daycare: 'Daycare',
    funerario: 'Servicio Funerario',
    peluqueria: 'Peluqueria',
    paseadores: 'Paseadores',
  },
}));

// AppScreen / AppHeader stubs
vi.mock('@/components/AppScreen', () => ({
  default: ({ children, header }) => (
    <div data-testid="app-screen">
      {header}
      {children}
    </div>
  ),
}));
vi.mock('@/components/AppHeader', () => ({
  default: ({ title }) => <div data-testid="app-header">{title}</div>,
}));

// Child component stubs that expose their props as text
vi.mock('@/components/ServiceRequest/PriceDisplay', () => ({
  PriceDisplay: ({ total, description }) => (
    <div data-testid="price-display">
      <span data-testid="total-price">{total}</span>
      {description && <span data-testid="price-description">{description}</span>}
    </div>
  ),
}));

vi.mock('@/components/ServiceRequest/StandardServiceForm', () => ({
  StandardServiceForm: (props) => (
    <div data-testid="standard-service-form">
      <span data-testid="needs-duration">{String(props.needsDuration)}</span>
    </div>
  ),
}));

vi.mock('@/components/ServiceRequest/FuneralServiceForm', () => ({
  FuneralServiceForm: () => <div data-testid="funeral-service-form" />,
}));

vi.mock('@/components/ServiceRequest/GroomingServiceForm', () => ({
  GroomingServiceForm: () => <div data-testid="grooming-service-form" />,
}));

vi.mock('@/components/ServiceRequest/WalkerServiceForm', () => ({
  WalkerServiceForm: () => <div data-testid="walker-service-form" />,
}));

vi.mock('@/components/ServiceRequest/ActionButtons', () => ({
  ActionButtons: ({
    onSubmit,
    isSubmitting,
    isFormComplete,
    showContactButtons,
  }) => (
    <div data-testid="action-buttons">
      <button data-testid="submit-button" onClick={onSubmit}>
        Submit
      </button>
      <span data-testid="is-submitting">{String(isSubmitting)}</span>
      <span data-testid="is-form-complete">{String(isFormComplete)}</span>
      <span data-testid="show-contact-buttons">
        {String(showContactButtons)}
      </span>
    </div>
  ),
}));

// ---- Tests ----

describe('ServiceRequestScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentServiceType = 'hospedaje';
    mockGroomingForm.isFormComplete.mockReturnValue(false);
    mockFuneralForm.isFormComplete.mockReturnValue(false);
    mockWalkerForm.isFormComplete.mockReturnValue(false);
  });

  async function renderScreen(serviceType) {
    if (serviceType) currentServiceType = serviceType;
    const mod = await import('./src/app/service-request.jsx');
    const ServiceRequestScreen = mod.default;
    return render(<ServiceRequestScreen />);
  }

  // ---- Initial render ----

  test('exports a default function component', async () => {
    const mod = await import('./src/app/service-request.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('renders the app header with correct title for hospedaje', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByText('Hospedaje')).toBeTruthy();
  });

  test('renders price display with calculated total', async () => {
    await renderScreen('hospedaje');
    const priceDisplay = screen.getByTestId('price-display');
    expect(priceDisplay).toBeTruthy();
    // base_price=50 * days=1
    expect(screen.getByTestId('total-price').textContent).toBe('50');
  });

  test('shows price description from pricing data', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByTestId('price-description').textContent).toBe(
      'Servicio estándar'
    );
  });

  // ---- Service type routing ----

  test('renders standard service form for hospedaje service', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByTestId('standard-service-form')).toBeTruthy();
    expect(screen.queryByTestId('funeral-service-form')).toBeNull();
    expect(screen.queryByTestId('grooming-service-form')).toBeNull();
    expect(screen.queryByTestId('walker-service-form')).toBeNull();
  });

  test('renders funeral service form for funerario service', async () => {
    await renderScreen('funerario');
    expect(screen.getByTestId('funeral-service-form')).toBeTruthy();
    expect(screen.queryByTestId('standard-service-form')).toBeNull();
  });

  test('renders grooming service form for peluqueria service', async () => {
    await renderScreen('peluqueria');
    expect(screen.getByTestId('grooming-service-form')).toBeTruthy();
    expect(screen.queryByTestId('standard-service-form')).toBeNull();
  });

  test('renders walker service form for paseadores service', async () => {
    await renderScreen('paseadores');
    expect(screen.getByTestId('walker-service-form')).toBeTruthy();
    expect(screen.queryByTestId('standard-service-form')).toBeNull();
  });

  // ---- Duration logic ----

  test('passes needsDuration=true for hospedaje', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByTestId('needs-duration').textContent).toBe('true');
  });

  test('passes needsDuration=true for daycare', async () => {
    await renderScreen('daycare');
    expect(screen.getByTestId('needs-duration').textContent).toBe('true');
  });

  // ---- Contact buttons visibility ----

  test('shows contact buttons for standard service', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByTestId('show-contact-buttons').textContent).toBe('true');
  });

  test('hides contact buttons for funeral service', async () => {
    await renderScreen('funerario');
    expect(screen.getByTestId('show-contact-buttons').textContent).toBe(
      'false'
    );
  });

  test('hides contact buttons for grooming service', async () => {
    await renderScreen('peluqueria');
    expect(screen.getByTestId('show-contact-buttons').textContent).toBe(
      'false'
    );
  });

  test('hides contact buttons for walker service', async () => {
    await renderScreen('paseadores');
    expect(screen.getByTestId('show-contact-buttons').textContent).toBe(
      'false'
    );
  });

  // ---- Form completeness ----

  test('isFormComplete is true for standard service by default', async () => {
    await renderScreen('hospedaje');
    expect(screen.getByTestId('is-form-complete').textContent).toBe('true');
  });

  test('isFormComplete is false for funeral when form is incomplete', async () => {
    mockFuneralForm.isFormComplete.mockReturnValue(false);
    await renderScreen('funerario');
    expect(screen.getByTestId('is-form-complete').textContent).toBe('false');
  });

  test('isFormComplete is false for walker when form is incomplete', async () => {
    mockWalkerForm.isFormComplete.mockReturnValue(false);
    await renderScreen('paseadores');
    expect(screen.getByTestId('is-form-complete').textContent).toBe('false');
  });

  // ---- Submit validation ----

  test('shows alert when submitting standard form without contact info', async () => {
    await renderScreen('hospedaje');
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Error',
      'Ingresa al menos un método de contacto'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('shows alert when submitting walker form with incomplete fields', async () => {
    mockWalkerForm.isFormComplete.mockReturnValue(false);
    await renderScreen('paseadores');
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Error',
      'Por favor completa todos los campos requeridos'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('shows alert when submitting funeral form with incomplete fields', async () => {
    mockFuneralForm.isFormComplete.mockReturnValue(false);
    await renderScreen('funerario');
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Error',
      'Por favor completa todos los campos requeridos'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  test('shows alert when submitting grooming form with incomplete fields', async () => {
    mockGroomingForm.isFormComplete.mockReturnValue(false);
    await renderScreen('peluqueria');
    fireEvent.click(screen.getByTestId('submit-button'));
    expect(mockAlert).toHaveBeenCalledWith(
      'Error',
      'Por favor completa todos los campos requeridos'
    );
    expect(mockMutate).not.toHaveBeenCalled();
  });

  // ---- Successful submissions ----

  test('calls mutate with walker data when walker form is complete', async () => {
    mockWalkerForm.isFormComplete.mockReturnValue(true);
    mockWalkerForm.walkerDogName = 'Rex';
    mockWalkerForm.walkerDogBreed = 'Labrador';
    mockWalkerForm.walkerDogAge = '3';
    mockWalkerForm.walkerDogWeight = '25';
    mockWalkerForm.walkerPhone = '555-1234';
    mockWalkerForm.walkerAddress = '123 Dog St';
    mockWalkerForm.walkerRequirements = 'Gentle walk';

    await renderScreen('paseadores');
    fireEvent.click(screen.getByTestId('submit-button'));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const callArg = mockMutate.mock.calls[0][0];
    expect(callArg.service_type).toBe('paseadores');
    expect(callArg.duration_days).toBe(1);
    const notesObj = JSON.parse(callArg.notes);
    expect(notesObj.dog.name).toBe('Rex');
    expect(notesObj.service.address).toBe('123 Dog St');
  });
});

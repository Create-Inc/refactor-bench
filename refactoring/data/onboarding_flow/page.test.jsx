import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// -- Mock hooks --

const mockUser = { id: 'user-1', name: 'Test User' };
vi.mock('@/utils/useUser', () => ({
  default: () => ({ data: mockUser }),
}));

let currentStep = 1;
const mockSaveProgress = vi.fn();
const mockSetCurrentStep = vi.fn((val) => { currentStep = typeof val === 'function' ? val(currentStep) : val; });
const mockSetImportedCount = vi.fn();
const mockSetProviderCount = vi.fn();

vi.mock('@/hooks/useOnboardingProgress', () => ({
  useOnboardingProgress: () => ({
    currentStep,
    setCurrentStep: mockSetCurrentStep,
    importedCount: 0,
    setImportedCount: mockSetImportedCount,
    providerCount: 0,
    setProviderCount: mockSetProviderCount,
    saveProgress: mockSaveProgress,
    getProgressPercentage: () => currentStep * 20,
  }),
}));

const mockShowSnackbar = vi.fn();
vi.mock('@/hooks/useSnackbar', () => ({
  useSnackbar: () => ({
    snackbar: null,
    showSnackbar: mockShowSnackbar,
  }),
}));

let mockAllChecked = false;
const mockConsents = {};
const mockSetConsents = vi.fn();
vi.mock('@/hooks/useLegalConsent', () => ({
  useLegalConsent: () => ({
    consents: mockConsents,
    setConsents: mockSetConsents,
    allChecked: mockAllChecked,
  }),
}));

const mockSaveToDatabase = vi.fn(() => Promise.resolve());
vi.mock('@/hooks/useHealthProfile', () => ({
  useHealthProfile: () => ({
    healthProfile: {},
    setHealthProfile: vi.fn(),
    saveToDatabase: mockSaveToDatabase,
  }),
}));

vi.mock('@/hooks/useFileUpload', () => ({
  useFileUpload: () => ({
    uploadProgress: 0,
    isUploading: false,
    extractedRecords: [],
    setExtractedRecords: vi.fn(),
    csvPreview: null,
    setCsvPreview: vi.fn(),
    handleFileUpload: vi.fn(),
    handleCsvUpload: vi.fn(),
  }),
}));

// -- Mock child components as stubs that expose callbacks --

vi.mock('@/components/Onboarding/WelcomeStep', () => ({
  WelcomeStep: ({ onGetStarted, onShowModal }) => (
    <div data-testid="welcome-step">
      <button data-testid="get-started-btn" onClick={onGetStarted}>Get Started</button>
      <button data-testid="show-modal-btn" onClick={() => onShowModal('test')}>Show Modal</button>
    </div>
  ),
}));

vi.mock('@/components/Onboarding/LegalConsentStep', () => ({
  LegalConsentStep: ({ progressPercentage, onContinue, stepNumber, totalSteps }) => (
    <div data-testid="legal-consent-step">
      <span data-testid="progress">{progressPercentage}</span>
      <span data-testid="step-info">{stepNumber}/{totalSteps}</span>
      <button data-testid="consent-continue-btn" onClick={onContinue}>Continue</button>
    </div>
  ),
}));

vi.mock('@/components/Onboarding/HealthProfileStep', () => ({
  HealthProfileStep: ({ onContinue, onSkip, stepNumber, totalSteps }) => (
    <div data-testid="health-profile-step">
      <span data-testid="step-info">{stepNumber}/{totalSteps}</span>
      <button data-testid="health-continue-btn" onClick={onContinue}>Continue</button>
      <button data-testid="health-skip-btn" onClick={onSkip}>Skip</button>
    </div>
  ),
}));

vi.mock('@/components/Onboarding/ImportRecordsStep', () => ({
  ImportRecordsStep: ({ onContinue, onShowModal, importedCount, providerCount }) => (
    <div data-testid="import-records-step">
      <span data-testid="imported-count">{importedCount}</span>
      <span data-testid="provider-count">{providerCount}</span>
      <button data-testid="import-continue-btn" onClick={onContinue}>Continue</button>
      <button data-testid="show-portal-btn" onClick={() => onShowModal('portalConnect')}>Portal</button>
      <button data-testid="show-manual-btn" onClick={() => onShowModal('manualEntry')}>Manual</button>
    </div>
  ),
}));

vi.mock('@/components/Onboarding/ReadyStep', () => ({
  ReadyStep: ({ importedCount, providerCount, onComplete }) => (
    <div data-testid="ready-step">
      <span data-testid="final-imported">{importedCount}</span>
      <span data-testid="final-providers">{providerCount}</span>
      <button data-testid="complete-btn" onClick={onComplete}>Complete</button>
    </div>
  ),
}));

vi.mock('@/components/Onboarding/Snackbar', () => ({
  Snackbar: ({ snackbar }) => snackbar ? <div data-testid="snackbar">{snackbar.message}</div> : null,
}));

vi.mock('@/components/Onboarding/VerificationModal', () => ({
  VerificationModal: ({ extractedRecords, onSave, onCancel }) =>
    extractedRecords ? <div data-testid="verification-modal"><button onClick={onSave}>Save</button><button onClick={onCancel}>Cancel</button></div> : null,
}));

vi.mock('@/components/Onboarding/CsvPreviewModal', () => ({
  CsvPreviewModal: ({ csvPreview, onImport, onCancel }) =>
    csvPreview ? <div data-testid="csv-preview-modal"><button onClick={onImport}>Import</button><button onClick={onCancel}>Cancel</button></div> : null,
}));

vi.mock('@/components/Onboarding/PortalConnectModal', () => ({
  PortalConnectModal: ({ onClose }) => <div data-testid="portal-connect-modal"><button onClick={onClose}>Close</button></div>,
}));

vi.mock('@/components/Onboarding/ManualEntryModal', () => ({
  ManualEntryModal: ({ onClose }) => <div data-testid="manual-entry-modal"><button onClick={onClose}>Close</button></div>,
}));

vi.mock('@/components/Onboarding/LegalDocumentModal', () => ({
  LegalDocumentModal: ({ modalType, onClose }) =>
    modalType ? <div data-testid="legal-doc-modal"><button onClick={onClose}>Close</button></div> : null,
}));

// -- Tests --

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentStep = 1;
    mockAllChecked = false;
  });

  async function renderPage(step) {
    if (step !== undefined) currentStep = step;
    const mod = await import('./src/app/page.jsx');
    const OnboardingPage = mod.default;
    return render(<OnboardingPage />);
  }

  // -- Step 1: Welcome --

  test('renders welcome step on initial load (step 1)', async () => {
    await renderPage(1);
    expect(screen.getByTestId('welcome-step')).toBeTruthy();
  });

  test('advances to step 2 when clicking Get Started', async () => {
    await renderPage(1);
    fireEvent.click(screen.getByTestId('get-started-btn'));
    expect(mockSaveProgress).toHaveBeenCalledWith(2);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(2);
  });

  // -- Step 2: Legal Consent --

  test('renders legal consent step on step 2', async () => {
    await renderPage(2);
    expect(screen.getByTestId('legal-consent-step')).toBeTruthy();
  });

  test('shows step number 2/5 on legal consent step', async () => {
    await renderPage(2);
    expect(screen.getByTestId('step-info').textContent).toBe('2/5');
  });

  test('shows snackbar error when continuing without all consents checked', async () => {
    mockAllChecked = false;
    await renderPage(2);
    fireEvent.click(screen.getByTestId('consent-continue-btn'));
    expect(mockShowSnackbar).toHaveBeenCalledWith(
      'Please accept all consent items to continue',
      'error'
    );
    expect(mockSaveProgress).not.toHaveBeenCalled();
  });

  test('advances to step 3 when all consents are checked and Continue is clicked', async () => {
    mockAllChecked = true;
    await renderPage(2);
    fireEvent.click(screen.getByTestId('consent-continue-btn'));
    expect(mockSaveProgress).toHaveBeenCalledWith(3);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(3);
  });

  // -- Step 3: Health Profile --

  test('renders health profile step on step 3', async () => {
    await renderPage(3);
    expect(screen.getByTestId('health-profile-step')).toBeTruthy();
  });

  test('saves to database and advances on health profile continue', async () => {
    await renderPage(3);
    fireEvent.click(screen.getByTestId('health-continue-btn'));
    await waitFor(() => {
      expect(mockSaveToDatabase).toHaveBeenCalled();
      expect(mockSaveProgress).toHaveBeenCalledWith(4);
      expect(mockSetCurrentStep).toHaveBeenCalledWith(4);
    });
  });

  test('skips health profile and advances to step 4', async () => {
    await renderPage(3);
    fireEvent.click(screen.getByTestId('health-skip-btn'));
    expect(mockSaveProgress).toHaveBeenCalledWith(4);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(4);
  });

  // -- Step 4: Import Records --

  test('renders import records step on step 4', async () => {
    await renderPage(4);
    expect(screen.getByTestId('import-records-step')).toBeTruthy();
  });

  test('advances to step 5 from import records', async () => {
    await renderPage(4);
    fireEvent.click(screen.getByTestId('import-continue-btn'));
    expect(mockSaveProgress).toHaveBeenCalledWith(5);
    expect(mockSetCurrentStep).toHaveBeenCalledWith(5);
  });

  // -- Step 5: Ready --

  test('renders ready step on step 5', async () => {
    await renderPage(5);
    expect(screen.getByTestId('ready-step')).toBeTruthy();
  });

  test('calls API and redirects on complete', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true }));
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
    delete window.location;
    window.location = { href: '' };

    await renderPage(5);
    fireEvent.click(screen.getByTestId('complete-btn'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({
        method: 'PATCH',
        body: expect.stringContaining('onboarding_completed'),
      }));
    });

    await waitFor(() => {
      expect(window.location.href).toBe('/dashboard');
    });
  });

  // -- Null render for unknown step --

  test('returns null for an unknown step', async () => {
    currentStep = 99;
    const mod = await import('./src/app/page.jsx');
    const OnboardingPage = mod.default;
    const { container } = render(<OnboardingPage />);
    expect(container.innerHTML).toBe('');
  });

  // -- Component is valid --

  test('exports a default function component', async () => {
    const mod = await import('./src/app/page.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });
});

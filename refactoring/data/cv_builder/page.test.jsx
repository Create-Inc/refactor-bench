import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// ---- Mocks ----

// User hook
let mockUser = { name: 'Test User', email: 'test@example.com' };
let mockUserLoading = false;
vi.mock('@/utils/useUser', () => ({
  default: () => ({ data: mockUser, loading: mockUserLoading }),
}));

// Upload hook
const mockUploadFn = vi.fn();
vi.mock('@/utils/useUpload', () => ({
  default: () => [mockUploadFn, { loading: false }],
}));

// fetchJson
vi.mock('@/utils/fetchJson', () => ({
  fetchJson: vi.fn(async (url) => {
    if (url.match(/\/api\/cv\/[^/]+\/versions/)) {
      return { versions: mockVersions };
    }
    if (url.match(/\/api\/cv\//)) {
      return { cv: mockCVData };
    }
    return {};
  }),
}));

// Auth header
vi.mock('@/hooks/useAuthHeader', () => ({
  useAuthHeader: (user, loading) => ({
    headerRight: <div data-testid="header-right">Auth</div>,
    isSignedIn: !!user && !loading,
  }),
}));

// react-query
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey, queryFn, enabled }) => {
    if (enabled === false) {
      return { data: null, isLoading: false };
    }
    if (queryKey[0] === 'cv' && queryKey[2] === 'versions') {
      return {
        data: { versions: mockVersions },
        isLoading: false,
      };
    }
    if (queryKey[0] === 'cv') {
      return {
        data: { cv: mockCVData },
        isLoading: mockCVLoading,
      };
    }
    return { data: null, isLoading: false };
  },
}));

// CV hooks - all return mutation objects or functions
const mockSaveMutate = vi.fn();
vi.mock('@/hooks/useCVSave', () => ({
  useCVSave: (...args) => ({ mutate: mockSaveMutate, isPending: false }),
}));

const mockRefineMutate = vi.fn();
vi.mock('@/hooks/useCVRefine', () => ({
  useCVRefine: (...args) => ({ mutate: mockRefineMutate, isPending: false }),
}));

const mockTailorMutate = vi.fn();
vi.mock('@/hooks/useCVTailor', () => ({
  useCVTailor: (...args) => ({ mutate: mockTailorMutate, isPending: false }),
}));

const mockSaveVersionMutate = vi.fn();
vi.mock('@/hooks/useCVVersion', () => ({
  useCVVersion: (...args) => ({
    mutate: mockSaveVersionMutate,
    isPending: false,
  }),
}));

vi.mock('@/hooks/useCVExtract', () => ({
  useCVExtract: () => vi.fn(),
}));

vi.mock('@/hooks/usePDFExport', () => ({
  usePDFExport: () => vi.fn(),
}));

// Checklist hook
vi.mock('@/hooks/useCVChecklist', () => ({
  useCVChecklist: (activeText, location, targetRole, visaStatus) => ({
    checklist: [
      { label: 'Has contact info', passed: activeText.length > 0 },
      { label: 'Has target role', passed: !!targetRole },
    ],
    checklistScore: activeText.length > 0 ? 50 : 0,
    missingChecklistItems: activeText.length > 0 ? 1 : 2,
    scoreTone: activeText.length > 0 ? 'warning' : 'danger',
  }),
}));

// ---- Child component stubs ----

vi.mock('@/components/CVEditor/Header', () => ({
  Header: ({ headerRight }) => (
    <div data-testid="header">{headerRight}</div>
  ),
}));

vi.mock('@/components/CVEditor/SignInBlock', () => ({
  SignInBlock: () => <div data-testid="sign-in-block">Please sign in</div>,
}));

vi.mock('@/components/CVEditor/PageBanner', () => ({
  PageBanner: () => <div data-testid="page-banner" />,
}));

vi.mock('@/components/CVEditor/EditorHeader', () => ({
  EditorHeader: ({ cv, saveMutation, saveVersionMutation }) => (
    <div data-testid="editor-header">
      <button data-testid="save-btn" onClick={() => saveMutation.mutate()}>
        Save
      </button>
      <button
        data-testid="save-version-btn"
        onClick={() => saveVersionMutation.mutate()}
      >
        Save Version
      </button>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/MessageBanner', () => ({
  MessageBanner: ({ error, success }) => (
    <div data-testid="message-banner">
      {error && <span data-testid="error-message">{error}</span>}
      {success && <span data-testid="success-message">{success}</span>}
    </div>
  ),
}));

vi.mock('@/components/CVEditor/BasicInfoFields', () => ({
  BasicInfoFields: ({
    title,
    setTitle,
    targetRole,
    setTargetRole,
    seniority,
    setSeniority,
    location,
    setLocation,
    visaStatus,
    setVisaStatus,
  }) => (
    <div data-testid="basic-info-fields">
      <input
        data-testid="title-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        data-testid="target-role-input"
        value={targetRole}
        onChange={(e) => setTargetRole(e.target.value)}
      />
      <select
        data-testid="seniority-select"
        value={seniority}
        onChange={(e) => setSeniority(e.target.value)}
      >
        <option value="Junior">Junior</option>
        <option value="Mid">Mid</option>
        <option value="Senior">Senior</option>
      </select>
      <input
        data-testid="location-input"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <input
        data-testid="visa-input"
        value={visaStatus}
        onChange={(e) => setVisaStatus(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('@/components/CVEditor/VeyonTip', () => ({
  VeyonTip: () => <div data-testid="veyon-tip" />,
}));

vi.mock('@/components/CVEditor/PDFExportSection', () => ({
  PDFExportSection: ({
    candidateName,
    setCandidateName,
    pdfTemplate,
    setPdfTemplate,
    handlePdfExport,
  }) => (
    <div data-testid="pdf-export-section">
      <input
        data-testid="candidate-name-input"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
      />
      <select
        data-testid="template-select"
        value={pdfTemplate}
        onChange={(e) => setPdfTemplate(e.target.value)}
      >
        <option value="modern">Modern</option>
        <option value="classic">Classic</option>
      </select>
      <button data-testid="export-pdf-btn" onClick={handlePdfExport}>
        Export PDF
      </button>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/CVTextSection', () => ({
  CVTextSection: ({ rawText, setRawText, refineMutation }) => (
    <div data-testid="cv-text-section">
      <textarea
        data-testid="raw-text-input"
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
      />
      <button
        data-testid="refine-btn"
        onClick={() => refineMutation.mutate()}
      >
        Refine
      </button>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/JobDescriptionSection', () => ({
  JobDescriptionSection: ({
    jobDescription,
    setJobDescription,
    tailorMutation,
  }) => (
    <div data-testid="job-description-section">
      <textarea
        data-testid="job-desc-input"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />
      <button
        data-testid="tailor-btn"
        onClick={() => tailorMutation.mutate()}
      >
        Tailor
      </button>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/RefinedTextSection', () => ({
  RefinedTextSection: ({ refinedText, setRefinedText }) => (
    <div data-testid="refined-text-section">
      <textarea
        data-testid="refined-text-input"
        value={refinedText}
        onChange={(e) => setRefinedText(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('@/components/CVEditor/NotesSection', () => ({
  NotesSection: ({ notes, setNotes }) => (
    <div data-testid="notes-section">
      <textarea
        data-testid="notes-input"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  ),
}));

vi.mock('@/components/CVEditor/FitCheckPanel', () => ({
  FitCheckPanel: ({
    checklistScore,
    scoreTone,
    checklist,
    missingChecklistItems,
  }) => (
    <div data-testid="fit-check-panel">
      <span data-testid="checklist-score">{checklistScore}</span>
      <span data-testid="score-tone">{scoreTone}</span>
      <span data-testid="missing-items">{missingChecklistItems}</span>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/VersionsPanel', () => ({
  VersionsPanel: ({ versions }) => (
    <div data-testid="versions-panel">
      <span data-testid="version-count">{versions.length}</span>
    </div>
  ),
}));

vi.mock('@/components/CVEditor/QuickRemindersPanel', () => ({
  QuickRemindersPanel: () => <div data-testid="quick-reminders" />,
}));

vi.mock('@/components/CVEditor/SmartToolsSection', () => ({
  SmartToolsSection: () => <div data-testid="smart-tools" />,
}));

// ---- Test data ----

let mockCVData = {
  title: 'My CV',
  target_role: 'Software Engineer',
  content: {
    rawText: 'Experience: 5 years in software development',
    refinedText: 'Refined experience text',
    notes: 'Some notes',
    meta: {
      seniority: 'Senior',
      location: 'London, UK',
      visaStatus: 'Citizen',
    },
  },
};

let mockCVLoading = false;
let mockVersions = [
  { id: 'v1', created_at: '2024-01-01' },
  { id: 'v2', created_at: '2024-01-15' },
];

// ---- Tests ----

describe('CvEditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = { name: 'Test User', email: 'test@example.com' };
    mockUserLoading = false;
    mockCVLoading = false;
    mockCVData = {
      title: 'My CV',
      target_role: 'Software Engineer',
      content: {
        rawText: 'Experience: 5 years in software development',
        refinedText: 'Refined experience text',
        notes: 'Some notes',
        meta: {
          seniority: 'Senior',
          location: 'London, UK',
          visaStatus: 'Citizen',
        },
      },
    };
    mockVersions = [
      { id: 'v1', created_at: '2024-01-01' },
      { id: 'v2', created_at: '2024-01-15' },
    ];
  });

  async function renderPage(params = { id: 'cv-123' }) {
    const mod = await import('./src/app/page.jsx');
    const CvEditorPage = mod.default;
    return render(<CvEditorPage params={params} />);
  }

  // ---- Basic rendering ----

  test('exports a default function component', async () => {
    const mod = await import('./src/app/page.jsx');
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe('function');
  });

  test('renders header with auth info', async () => {
    await renderPage();
    expect(screen.getByTestId('header')).toBeTruthy();
    expect(screen.getByTestId('header-right')).toBeTruthy();
  });

  // ---- Sign-in state ----

  test('shows sign-in block when user is not signed in', async () => {
    mockUser = null;
    mockUserLoading = false;
    await renderPage();
    expect(screen.getByTestId('sign-in-block')).toBeTruthy();
    expect(screen.getByText('Please sign in')).toBeTruthy();
  });

  test('hides sign-in block when user is signed in', async () => {
    await renderPage();
    expect(screen.queryByTestId('sign-in-block')).toBeNull();
  });

  test('does not show editor content when not signed in', async () => {
    mockUser = null;
    await renderPage();
    expect(screen.queryByTestId('page-banner')).toBeNull();
    expect(screen.queryByTestId('editor-header')).toBeNull();
  });

  // ---- Signed-in content ----

  test('shows page banner when signed in', async () => {
    await renderPage();
    expect(screen.getByTestId('page-banner')).toBeTruthy();
  });

  test('renders editor header with save buttons', async () => {
    await renderPage();
    expect(screen.getByTestId('editor-header')).toBeTruthy();
    expect(screen.getByTestId('save-btn')).toBeTruthy();
    expect(screen.getByTestId('save-version-btn')).toBeTruthy();
  });

  test('renders basic info fields', async () => {
    await renderPage();
    expect(screen.getByTestId('basic-info-fields')).toBeTruthy();
  });

  test('renders all editor sections', async () => {
    await renderPage();
    expect(screen.getByTestId('cv-text-section')).toBeTruthy();
    expect(screen.getByTestId('job-description-section')).toBeTruthy();
    expect(screen.getByTestId('refined-text-section')).toBeTruthy();
    expect(screen.getByTestId('notes-section')).toBeTruthy();
    expect(screen.getByTestId('pdf-export-section')).toBeTruthy();
    expect(screen.getByTestId('smart-tools')).toBeTruthy();
  });

  test('renders sidebar panels', async () => {
    await renderPage();
    expect(screen.getByTestId('fit-check-panel')).toBeTruthy();
    expect(screen.getByTestId('versions-panel')).toBeTruthy();
    expect(screen.getByTestId('quick-reminders')).toBeTruthy();
  });

  // ---- Default state values ----

  test('has correct default seniority value of Mid', async () => {
    mockCVData = { title: '', target_role: '', content: {} };
    await renderPage();
    expect(screen.getByTestId('seniority-select').value).toBe('Mid');
  });

  test('has correct default location value', async () => {
    mockCVData = { title: '', target_role: '', content: {} };
    await renderPage();
    expect(screen.getByTestId('location-input').value).toBe('Dubai, UAE');
  });

  test('has correct default pdf template of modern', async () => {
    await renderPage();
    expect(screen.getByTestId('template-select').value).toBe('modern');
  });

  // ---- Interactions ----

  test('can update title field', async () => {
    await renderPage();
    const titleInput = screen.getByTestId('title-input');
    fireEvent.change(titleInput, { target: { value: 'Updated CV Title' } });
    expect(titleInput.value).toBe('Updated CV Title');
  });

  test('can update target role field', async () => {
    await renderPage();
    const roleInput = screen.getByTestId('target-role-input');
    fireEvent.change(roleInput, { target: { value: 'Product Manager' } });
    expect(roleInput.value).toBe('Product Manager');
  });

  test('can update raw text', async () => {
    await renderPage();
    const rawInput = screen.getByTestId('raw-text-input');
    fireEvent.change(rawInput, { target: { value: 'New raw CV text' } });
    expect(rawInput.value).toBe('New raw CV text');
  });

  test('save button triggers save mutation', async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId('save-btn'));
    expect(mockSaveMutate).toHaveBeenCalled();
  });

  test('save version button triggers save version mutation', async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId('save-version-btn'));
    expect(mockSaveVersionMutate).toHaveBeenCalled();
  });

  test('refine button triggers refine mutation', async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId('refine-btn'));
    expect(mockRefineMutate).toHaveBeenCalled();
  });

  test('tailor button triggers tailor mutation', async () => {
    await renderPage();
    fireEvent.click(screen.getByTestId('tailor-btn'));
    expect(mockTailorMutate).toHaveBeenCalled();
  });

  // ---- Fit check panel ----

  test('fit check panel receives checklist score', async () => {
    await renderPage();
    const scoreEl = screen.getByTestId('checklist-score');
    // With rawText present, score should be > 0
    expect(Number(scoreEl.textContent)).toBeGreaterThan(0);
  });

  // ---- Versions panel ----

  test('versions panel shows correct version count', async () => {
    await renderPage();
    expect(screen.getByTestId('version-count').textContent).toBe('2');
  });

  // ---- Loading state ----

  test('shows loading indicator when cv is loading', async () => {
    mockCVLoading = true;
    await renderPage();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  test('hides loading indicator when cv is loaded', async () => {
    mockCVLoading = false;
    await renderPage();
    expect(screen.queryByText('Loading...')).toBeNull();
  });

  // ---- Message banner ----

  test('renders message banner component', async () => {
    await renderPage();
    expect(screen.getByTestId('message-banner')).toBeTruthy();
  });
});

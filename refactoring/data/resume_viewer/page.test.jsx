import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useUpload
vi.mock('@/utils/useUpload', () => ({
  default: () => ({
    upload: vi.fn(),
    isUploading: false,
  }),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const React = require('react');
  const makeIcon = (name) => (props) => React.createElement('span', { 'data-testid': `icon-${name}`, ...props });
  return {
    FileText: makeIcon('file-text'),
    Link: makeIcon('link'),
    User: makeIcon('user'),
    ArrowRight: makeIcon('arrow-right'),
    Loader2: makeIcon('loader2'),
    Sparkles: makeIcon('sparkles'),
    Upload: makeIcon('upload'),
  };
});

// Mock UI components
vi.mock('../../components/ui', () => {
  const React = require('react');
  return {
    Button: ({ children, onClick, disabled, variant, className, ...rest }) =>
      React.createElement('button', { onClick, disabled, className, 'data-variant': variant, ...rest }, children),
    Card: ({ children, className }) =>
      React.createElement('div', { 'data-testid': 'card', className }, children),
    Pill: ({ children }) =>
      React.createElement('span', { 'data-testid': 'pill' }, children),
    Input: ({ label, value, onChange, placeholder, ...rest }) =>
      React.createElement('div', null,
        label && React.createElement('label', null, label),
        React.createElement('input', { value, onChange, placeholder, ...rest }),
      ),
    TextArea: ({ label, value, onChange, placeholder, className }) =>
      React.createElement('div', null,
        label && React.createElement('label', null, label),
        React.createElement('textarea', { value, onChange, placeholder, className }),
      ),
  };
});

import CreateResumePage from './src/app/page.jsx';

describe('CreateResumePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    global.alert = vi.fn();
  });

  // -- Step 1: Method selection --

  test('renders the page header with title', () => {
    render(<CreateResumePage />);
    expect(screen.getByText('Create ATS Resume')).toBeTruthy();
  });

  test('renders back to dashboard link', () => {
    render(<CreateResumePage />);
    expect(screen.getByText(/Back to Dashboard/)).toBeTruthy();
  });

  test('renders subtitle about templates', () => {
    render(<CreateResumePage />);
    expect(screen.getByText(/12 professional templates/)).toBeTruthy();
  });

  test('renders three method options on step 1', () => {
    render(<CreateResumePage />);
    expect(screen.getByText('Manual Entry')).toBeTruthy();
    expect(screen.getByText('Paste Resume')).toBeTruthy();
    expect(screen.getByText('LinkedIn Profile')).toBeTruthy();
  });

  test('renders method descriptions', () => {
    render(<CreateResumePage />);
    expect(screen.getByText(/Type or paste your information from scratch/)).toBeTruthy();
    expect(screen.getByText(/Copy text from your existing resume/)).toBeTruthy();
    expect(screen.getByText(/Paste details from your LinkedIn profile/)).toBeTruthy();
  });

  test('shows question "How would you like to start?"', () => {
    render(<CreateResumePage />);
    expect(screen.getByText('How would you like to start?')).toBeTruthy();
  });

  // -- Step 2: Input --

  test('advances to step 2 with correct heading when Manual Entry is clicked', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    expect(screen.getByText('Tell us about yourself')).toBeTruthy();
  });

  test('advances to step 2 with correct heading when Paste Resume is clicked', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Paste Resume'));
    expect(screen.getByText('Paste your resume text')).toBeTruthy();
  });

  test('advances to step 2 with correct heading when LinkedIn is clicked', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('LinkedIn Profile'));
    expect(screen.getByText('Paste LinkedIn Profile Content')).toBeTruthy();
  });

  test('shows correct label for LinkedIn method', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('LinkedIn Profile'));
    expect(screen.getByText(/Copy and paste text from your LinkedIn/)).toBeTruthy();
  });

  test('Continue button on step 2 is disabled when textarea is empty', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn.closest('button').disabled).toBe(true);
  });

  test('Continue button on step 2 is enabled when text is entered', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'I have experience in React' } });
    const continueBtn = screen.getByText('Continue');
    expect(continueBtn.closest('button').disabled).toBe(false);
  });

  test('Back button on step 2 returns to step 1', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('How would you like to start?')).toBeTruthy();
  });

  // -- Step 3: Confirmation --

  test('advancing to step 3 shows "Ready to Create Your Resume"', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'Some resume content' } });
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Ready to Create Your Resume')).toBeTruthy();
  });

  test('step 3 shows Generate My Resume button', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'Content' } });
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText('Generate My Resume')).toBeTruthy();
  });

  test('step 3 shows go-back link', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'Content' } });
    fireEvent.click(screen.getByText('Continue'));
    expect(screen.getByText(/Need to change something/)).toBeTruthy();
  });

  test('clicking go-back on step 3 returns to step 2', () => {
    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'Content here' } });
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText(/Need to change something/));
    expect(screen.getByText('Tell us about yourself')).toBeTruthy();
  });

  // -- Parsing / API --

  test('calls parse API when Generate My Resume is clicked', async () => {
    const parsedData = { personalInfo: { fullName: 'John Doe' } };
    const savedResume = { id: 'resume-123' };

    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => parsedData })
      .mockResolvedValueOnce({ ok: true, json: async () => savedResume });

    delete window.location;
    window.location = { href: '' };

    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'My resume content' } });
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Generate My Resume'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/parse-resume', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  test('shows alert when parsing fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Parse error' }),
    });

    render(<CreateResumePage />);
    fireEvent.click(screen.getByText('Manual Entry'));
    const textarea = screen.getByPlaceholderText(/software engineer with 5 years/);
    fireEvent.change(textarea, { target: { value: 'Content' } });
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Generate My Resume'));

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Parse error');
    });
  });

  // -- Component export --

  test('exports a default function component', () => {
    expect(CreateResumePage).toBeDefined();
    expect(typeof CreateResumePage).toBe('function');
  });
});

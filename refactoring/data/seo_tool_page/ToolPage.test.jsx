import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ToolPage from './src/app/ToolPage.jsx';

// ── Mocks ──────────────────────────────────────────────────────────────────

// Mock lucide-react – return simple spans so tests never depend on SVG internals
vi.mock('lucide-react', () => {
  const icon = (name) => {
    const Comp = (props) => <span data-testid={`icon-${name}`} {...props} />;
    Comp.displayName = name;
    return Comp;
  };
  return {
    Upload: icon('Upload'),
    CheckCircle: icon('CheckCircle'),
    AlertCircle: icon('AlertCircle'),
    Download: icon('Download'),
    FileText: icon('FileText'),
    Image: icon('Image'),
    Video: icon('Video'),
    File: icon('File'),
    ChevronRight: icon('ChevronRight'),
    Shield: icon('Shield'),
    Zap: icon('Zap'),
    Target: icon('Target'),
    Clock: icon('Clock'),
    ArrowRight: icon('ArrowRight'),
    Lock: icon('Lock'),
    Music: icon('Music'),
    Table: icon('Table'),
    Presentation: icon('Presentation'),
    FileArchive: icon('FileArchive'),
    BookOpen: icon('BookOpen'),
    Code: icon('Code'),
    Palette: icon('Palette'),
  };
});

// Mock FileCompressionEngine
const mockCompress = vi.fn();
vi.mock('@/components/FileCompressionEngine', () => ({
  FileCompressionEngine: vi.fn().mockImplementation(() => ({
    compress: mockCompress,
  })),
}));

// Mock SEO content generators
vi.mock('@/data/seo-content', () => ({
  generateH1: (tool) => `Compress ${tool.fileTypeLabel} Files`,
  generateIntro: (tool) => `Quickly reduce your ${tool.fileTypeLabel} to under ${tool.targetLabel}.`,
  generateWhySizeLimitsSection: (tool) => ({
    heading: `Why ${tool.fileTypeLabel} Size Limits Exist`,
    content: 'Many platforms impose strict file-size limits.',
    extra: 'Our tool helps you stay within those limits.',
  }),
  generateStepByStep: () => [
    { step: 1, title: 'Upload Your File', description: 'Choose a file from your device.' },
    { step: 2, title: 'Click Compress', description: 'We handle the rest.' },
    { step: 3, title: 'Download Result', description: 'Save the compressed file.' },
  ],
  generateTipsSection: () => [
    'Remove unnecessary metadata',
    'Use appropriate resolution',
  ],
  generateFAQs: () => [
    { question: 'Is it free?', answer: 'Yes, completely free.' },
    { question: 'Is it safe?', answer: 'Files never leave your browser.' },
    { question: 'What formats are supported?', answer: 'Many popular formats.' },
  ],
}));

// Mock related tools
vi.mock('@/data/rules', () => ({
  getRelatedTools: () => [
    {
      slug: 'compress-png-500kb',
      action: 'Compress',
      fileType: 'png',
      fileTypeLabel: 'PNG',
      targetLabel: '500kb',
      platform: null,
    },
    {
      slug: 'compress-jpg-200kb',
      action: 'Compress',
      fileType: 'jpg',
      fileTypeLabel: 'JPG',
      targetLabel: '200kb',
      platform: 'Instagram',
    },
  ],
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

const baseTool = {
  slug: 'compress-pdf-1mb',
  action: 'Compress',
  fileType: 'pdf',
  fileTypeLabel: 'PDF',
  targetLabel: '1mb',
  targetKB: 1024,
  platform: null,
  platformId: null,
  formats: ['pdf'],
  gerund: 'Compressing',
  dpi: null,
  dimensions: null,
  commonErrors: null,
};

function createFile(name = 'test.pdf', size = 2 * 1024 * 1024, type = 'application/pdf') {
  const file = new File([new ArrayBuffer(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('ToolPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: compression succeeds and returns a small blob
    mockCompress.mockResolvedValue(new Blob(['compressed'], { type: 'application/pdf' }));
    // Stub createObjectURL / revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  // ────────────────────── Initial Render ──────────────────────

  describe('Initial Render', () => {
    test('renders the heading generated from the tool prop', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /Compress PDF Files/i })
      ).toBeInTheDocument();
    });

    test('renders the intro paragraph', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/Quickly reduce your PDF to under 1mb/i)).toBeInTheDocument();
    });

    test('shows target label badge in the hero', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/Target: 1MB/i)).toBeInTheDocument();
    });

    test('shows the 100% Private badge', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/100% Private/i)).toBeInTheDocument();
    });

    test('renders upload prompt when no file is selected', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument();
    });

    test('shows accepted formats and target in the upload area', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/PDF.*Target: 1MB/i)).toBeInTheDocument();
    });

    test('does not show compress button when no file is selected', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.queryByRole('button', { name: /Compress to Under/i })).not.toBeInTheDocument();
    });
  });

  // ────────────────────── Breadcrumb / Navigation ──────────────────────

  describe('Breadcrumb Navigation', () => {
    test('renders Home breadcrumb link', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    });

    test('shows platform breadcrumb when platformId is set', () => {
      const toolWithPlatform = {
        ...baseTool,
        platform: 'LinkedIn',
        platformId: 'linkedin',
      };
      render(<ToolPage tool={toolWithPlatform} />);
      const link = screen.getByRole('link', { name: 'LinkedIn' });
      expect(link).toHaveAttribute('href', '/platform/linkedin');
    });

    test('omits platform breadcrumb when platformId is null', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.queryByRole('link', { name: /LinkedIn/i })).not.toBeInTheDocument();
    });
  });

  // ────────────────────── File Selection ──────────────────────

  describe('File Selection', () => {
    test('displays file name after selecting a file via input', () => {
      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      const file = createFile('report.pdf');
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText('report.pdf')).toBeInTheDocument();
    });

    test('displays file size after selecting a file', () => {
      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      const file = createFile('report.pdf', 500 * 1024); // 500 KB
      fireEvent.change(input, { target: { files: [file] } });

      expect(screen.getByText(/Current: 500\.0 KB/i)).toBeInTheDocument();
    });

    test('shows compress button after file is selected', () => {
      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile()] } });

      expect(screen.getByRole('button', { name: /Compress to Under 1MB/i })).toBeInTheDocument();
    });

    test('handles file selection via drag and drop', () => {
      render(<ToolPage tool={baseTool} />);
      const dropZone = screen.getByText(/Click to upload or drag and drop/i).closest('[class*="border-dashed"]');
      const file = createFile('dropped.pdf');

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      expect(screen.getByText('dropped.pdf')).toBeInTheDocument();
    });
  });

  // ────────────────────── Compression Flow ──────────────────────

  describe('Compression Flow', () => {
    test('shows processing state with progress indicator when compressing', async () => {
      // Make compress hang so we can observe the processing state
      mockCompress.mockReturnValue(new Promise(() => {}));

      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile()] } });

      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByText(/Compressing\.\.\./i)).toBeInTheDocument();
      });
    });

    test('shows success state with size reduction after successful compression', async () => {
      const compressedBlob = new Blob(['small'], { type: 'application/pdf' });
      Object.defineProperty(compressedBlob, 'size', { value: 500 * 1024 });
      mockCompress.mockResolvedValue(compressedBlob);

      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile('doc.pdf', 2 * 1024 * 1024)] } });

      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByText(/Compression Complete!/i)).toBeInTheDocument();
      });
    });

    test('displays reduction percentage after compression', async () => {
      const compressedBlob = new Blob(['x'], { type: 'application/pdf' });
      Object.defineProperty(compressedBlob, 'size', { value: 1024 * 1024 }); // 1MB
      mockCompress.mockResolvedValue(compressedBlob);

      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      // Original is 2MB
      fireEvent.change(input, { target: { files: [createFile('doc.pdf', 2 * 1024 * 1024)] } });

      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByText(/50% smaller/i)).toBeInTheDocument();
      });
    });

    test('renders download button after successful compression', async () => {
      mockCompress.mockResolvedValue(new Blob(['x'], { type: 'application/pdf' }));

      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Download Compressed PDF/i })).toBeInTheDocument();
      });
    });

    test('shows error state when compression fails', async () => {
      mockCompress.mockRejectedValue(new Error('engine failure'));

      render(<ToolPage tool={baseTool} />);
      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByText(/Compression Failed/i)).toBeInTheDocument();
        expect(screen.getByText(/Failed to compress file/i)).toBeInTheDocument();
      });
    });
  });

  // ────────────────────── Step-by-Step Section ──────────────────────

  describe('Step-by-Step Section', () => {
    test('renders how-to heading with tool action and file type', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /How to Compress PDF/i })
      ).toBeInTheDocument();
    });

    test('renders all step titles', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText('Upload Your File')).toBeInTheDocument();
      expect(screen.getByText('Click Compress')).toBeInTheDocument();
      expect(screen.getByText('Download Result')).toBeInTheDocument();
    });
  });

  // ────────────────────── Requirements Table ──────────────────────

  describe('Requirements Table', () => {
    test('displays maximum file size from tool', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText('Maximum File Size')).toBeInTheDocument();
    });

    test('shows processing description as browser-based', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/100% browser-based/i)).toBeInTheDocument();
    });

    test('shows accepted formats when tool.formats is provided', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText('Accepted Formats')).toBeInTheDocument();
    });

    test('shows DPI row when tool.dpi is set', () => {
      const toolWithDpi = { ...baseTool, dpi: 300 };
      render(<ToolPage tool={toolWithDpi} />);
      expect(screen.getByText('Resolution')).toBeInTheDocument();
      expect(screen.getByText('300 DPI')).toBeInTheDocument();
    });

    test('shows dimensions row when tool.dimensions is set', () => {
      const toolWithDims = { ...baseTool, dimensions: '1920x1080' };
      render(<ToolPage tool={toolWithDims} />);
      expect(screen.getByText('Dimensions')).toBeInTheDocument();
      expect(screen.getByText('1920x1080 pixels')).toBeInTheDocument();
    });

    test('shows common upload errors when present', () => {
      const toolWithErrors = {
        ...baseTool,
        commonErrors: ['File too large', 'Unsupported format'],
      };
      render(<ToolPage tool={toolWithErrors} />);
      expect(screen.getByText('Common Upload Errors')).toBeInTheDocument();
      expect(screen.getByText(/File too large/)).toBeInTheDocument();
      expect(screen.getByText(/Unsupported format/)).toBeInTheDocument();
    });
  });

  // ────────────────────── Tips Section ──────────────────────

  describe('Tips Section', () => {
    test('renders tips heading with file type label', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /Tips to Reduce PDF File Size/i })
      ).toBeInTheDocument();
    });

    test('renders individual tips', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText('Remove unnecessary metadata')).toBeInTheDocument();
      expect(screen.getByText('Use appropriate resolution')).toBeInTheDocument();
    });
  });

  // ────────────────────── Key Features ──────────────────────

  describe('Key Features', () => {
    test('renders the three feature cards', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText('Exact Size Targeting')).toBeInTheDocument();
      expect(screen.getByText('Privacy First')).toBeInTheDocument();
      expect(screen.getByText('Instant Results')).toBeInTheDocument();
    });

    test('feature card includes target label', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/under 1MB/i)).toBeInTheDocument();
    });
  });

  // ────────────────────── FAQ Section ──────────────────────

  describe('FAQ Section', () => {
    test('renders FAQ heading', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /Frequently Asked Questions/i })
      ).toBeInTheDocument();
    });

    test('renders FAQ questions as buttons', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByRole('button', { name: /Is it free\?/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Is it safe\?/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /What formats are supported\?/i })).toBeInTheDocument();
    });

    test('FAQ answer is hidden by default', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.queryByText('Yes, completely free.')).not.toBeInTheDocument();
    });

    test('clicking a FAQ question reveals the answer', () => {
      render(<ToolPage tool={baseTool} />);
      fireEvent.click(screen.getByRole('button', { name: /Is it free\?/i }));
      expect(screen.getByText('Yes, completely free.')).toBeInTheDocument();
    });

    test('clicking an open FAQ question hides the answer', () => {
      render(<ToolPage tool={baseTool} />);
      const btn = screen.getByRole('button', { name: /Is it free\?/i });
      fireEvent.click(btn);
      expect(screen.getByText('Yes, completely free.')).toBeInTheDocument();
      fireEvent.click(btn);
      expect(screen.queryByText('Yes, completely free.')).not.toBeInTheDocument();
    });

    test('opening a second FAQ closes the first', () => {
      render(<ToolPage tool={baseTool} />);
      fireEvent.click(screen.getByRole('button', { name: /Is it free\?/i }));
      expect(screen.getByText('Yes, completely free.')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Is it safe\?/i }));
      expect(screen.queryByText('Yes, completely free.')).not.toBeInTheDocument();
      expect(screen.getByText('Files never leave your browser.')).toBeInTheDocument();
    });
  });

  // ────────────────────── Related Tools ──────────────────────

  describe('Related Tools', () => {
    test('renders related tools heading', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /Related Compression Tools/i })
      ).toBeInTheDocument();
    });

    test('renders related tool links with correct hrefs', () => {
      render(<ToolPage tool={baseTool} />);
      const pngLink = screen.getByRole('link', { name: /Compress PNG/i });
      expect(pngLink).toHaveAttribute('href', '/tool/compress-png-500kb');

      const jpgLink = screen.getByRole('link', { name: /Compress JPG/i });
      expect(jpgLink).toHaveAttribute('href', '/tool/compress-jpg-200kb');
    });

    test('shows target labels on related tools', () => {
      render(<ToolPage tool={baseTool} />);
      expect(screen.getByText(/Target: 500KB/i)).toBeInTheDocument();
      expect(screen.getByText(/Target: 200KB/i)).toBeInTheDocument();
    });
  });

  // ────────────────────── Platform Hub Link ──────────────────────

  describe('Platform Hub Link', () => {
    test('shows platform hub section when platformId is set', () => {
      const toolWithPlatform = {
        ...baseTool,
        platform: 'LinkedIn',
        platformId: 'linkedin',
      };
      render(<ToolPage tool={toolWithPlatform} />);
      expect(
        screen.getByRole('heading', { name: /Need a Different LinkedIn Tool\?/i })
      ).toBeInTheDocument();
      const link = screen.getByRole('link', { name: /View All LinkedIn Tools/i });
      expect(link).toHaveAttribute('href', '/platform/linkedin');
    });

    test('hides platform hub section when platformId is null', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.queryByRole('heading', { name: /Need a Different.*Tool\?/i })
      ).not.toBeInTheDocument();
    });
  });

  // ────────────────────── Bottom CTA ──────────────────────

  describe('Bottom CTA', () => {
    test('renders bottom call-to-action heading', () => {
      render(<ToolPage tool={baseTool} />);
      expect(
        screen.getByRole('heading', { name: /Looking for a different tool\?/i })
      ).toBeInTheDocument();
    });

    test('renders Browse All Tools link to homepage', () => {
      render(<ToolPage tool={baseTool} />);
      const link = screen.getByRole('link', { name: /Browse All Tools/i });
      expect(link).toHaveAttribute('href', '/');
    });
  });

  // ────────────────────── Edge Cases ──────────────────────

  describe('Edge Cases', () => {
    test('renders without crashing for a minimal tool prop', () => {
      const minimalTool = {
        slug: 'compress-image-50kb',
        action: 'Compress',
        fileType: 'image',
        fileTypeLabel: 'Image',
        targetLabel: '50kb',
        targetKB: 50,
        platform: null,
        platformId: null,
        formats: null,
        gerund: null,
        dpi: null,
        dimensions: null,
        commonErrors: null,
      };
      expect(() => render(<ToolPage tool={minimalTool} />)).not.toThrow();
    });

    test('uses tool.fileTypeLabel when formats is null', () => {
      const toolNoFormats = { ...baseTool, formats: null };
      render(<ToolPage tool={toolNoFormats} />);
      // The upload area should fall back to fileTypeLabel
      expect(screen.getByText(/PDF.*Target: 1MB/i)).toBeInTheDocument();
    });

    test('uses default gerund "Processing" when tool.gerund is null', async () => {
      mockCompress.mockReturnValue(new Promise(() => {}));
      const toolNoGerund = { ...baseTool, gerund: null };
      render(<ToolPage tool={toolNoGerund} />);

      const input = document.querySelector('input[type="file"]');
      fireEvent.change(input, { target: { files: [createFile()] } });
      fireEvent.click(screen.getByRole('button', { name: /Compress to Under/i }));

      await waitFor(() => {
        expect(screen.getByText(/Processing\.\.\./i)).toBeInTheDocument();
      });
    });

    test('does not show common errors section when commonErrors is empty array', () => {
      const toolEmptyErrors = { ...baseTool, commonErrors: [] };
      render(<ToolPage tool={toolEmptyErrors} />);
      expect(screen.queryByText('Common Upload Errors')).not.toBeInTheDocument();
    });

    test('shows platform badge in hero when platform is set', () => {
      const toolWithPlatform = { ...baseTool, platform: 'Discord', platformId: 'discord' };
      render(<ToolPage tool={toolWithPlatform} />);
      expect(screen.getByText('Discord')).toBeInTheDocument();
    });
  });
});

import { describe, test, expect, beforeEach, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HurodeRayaPage from '.app/page.jsx';

// --- Global mocks ---

// Mock window.scrollTo
window.scrollTo = vi.fn();

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.entries = [];
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = MockIntersectionObserver;

// Mock HTMLMediaElement play/pause
window.HTMLMediaElement.prototype.play = vi.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.load = vi.fn();

// Mock fetch for contact form
global.fetch = vi.fn();

// Provide react-hook-form, sonner, and tanstack/react-query via the actual
// component's imports. We only mock fetch (the network call).

// Mock sonner toast for assertion
vi.mock('sonner', () => {
  const toast = {
    success: vi.fn(),
    error: vi.fn(),
  };
  const Toaster = () => null;
  return { toast, Toaster };
});

// We need a QueryClientProvider wrapper for @tanstack/react-query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <HurodeRayaPage />
    </QueryClientProvider>
  );
}

describe('HurodeRayaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetch.mockReset();
  });

  // ---- INITIAL RENDER / SMOKE ----

  describe('Initial Render', () => {
    test('renders without crashing', () => {
      expect(() => renderPage()).not.toThrow();
    });

    test('renders company name in header', () => {
      renderPage();
      expect(
        screen.getByText('BIO-TEXTURE-HURODE INDONESIA')
      ).toBeInTheDocument();
    });

    test('renders the hero tagline', () => {
      renderPage();
      expect(
        screen.getByText(/Partner Usaha Anda/i)
      ).toBeInTheDocument();
    });

    test('renders the hero heading', () => {
      renderPage();
      expect(
        screen.getByText(
          /Penyedia bahan pengolahan makanan dan minuman/i
        )
      ).toBeInTheDocument();
    });

    test('renders hero description text', () => {
      renderPage();
      expect(
        screen.getByText(
          /Menggunakan bahan organik dari dalam dan luar negeri/i
        )
      ).toBeInTheDocument();
    });

    test('renders hero CTA button', () => {
      renderPage();
      expect(
        screen.getByText(/Eksplorasi Proses & Mutu/i)
      ).toBeInTheDocument();
    });

    test('renders hero profile image with correct alt text', () => {
      renderPage();
      expect(
        screen.getByAltText('CV. Hurode Raya Profile')
      ).toBeInTheDocument();
    });
  });

  // ---- NAVIGATION ----

  describe('Desktop Navigation', () => {
    test('renders all desktop navigation links', () => {
      renderPage();
      const links = screen.getAllByRole('link');
      const linkTexts = links.map((l) => l.textContent.trim());

      expect(linkTexts).toContain('Profile');
      expect(linkTexts).toContain('Production');
      expect(linkTexts).toContain('BPOM & Halal');
      expect(linkTexts).toContain('Inventory');
      expect(linkTexts).toContain('Testimoni');
      expect(linkTexts).toContain('Partners');
    });
  });

  describe('Mobile Menu Toggle', () => {
    test('mobile menu is hidden by default', () => {
      renderPage();
      // The mobile nav items are duplicates; initially the mobile menu block is not rendered.
      // Desktop nav has one set of links. When mobile menu is closed,
      // each link text appears once (desktop only).
      const profileLinks = screen.getAllByText('Profile');
      expect(profileLinks).toHaveLength(1);
    });

    test('clicking hamburger button opens mobile menu', () => {
      renderPage();
      // The hamburger is the only button that contains three span children
      const buttons = screen.getAllByRole('button');
      // Find the hamburger by its span children count
      const hamburger = buttons.find(
        (b) => b.querySelectorAll('span').length === 3
      );
      expect(hamburger).toBeTruthy();

      fireEvent.click(hamburger);

      // Now the mobile menu links should also be present
      const profileLinks = screen.getAllByText('Profile');
      expect(profileLinks.length).toBeGreaterThan(1);
    });

    test('clicking hamburger again closes mobile menu', () => {
      renderPage();
      const buttons = screen.getAllByRole('button');
      const hamburger = buttons.find(
        (b) => b.querySelectorAll('span').length === 3
      );

      // Open
      fireEvent.click(hamburger);
      expect(screen.getAllByText('Profile').length).toBeGreaterThan(1);

      // Close
      fireEvent.click(hamburger);
      expect(screen.getAllByText('Profile')).toHaveLength(1);
    });

    test('clicking a mobile menu link closes the menu', () => {
      renderPage();
      const buttons = screen.getAllByRole('button');
      const hamburger = buttons.find(
        (b) => b.querySelectorAll('span').length === 3
      );

      fireEvent.click(hamburger);

      // Click the mobile "Production" link (second occurrence)
      const prodLinks = screen.getAllByText('Production');
      const mobileLink = prodLinks[prodLinks.length - 1];
      fireEvent.click(mobileLink);

      // Menu should close — only one set of links remains
      expect(screen.getAllByText('Production')).toHaveLength(1);
    });
  });

  // ---- WHATSAPP FLOAT ----

  describe('WhatsApp Floating Button', () => {
    test('renders WhatsApp link with correct href', () => {
      renderPage();
      const waLink = screen.getByText(/Hubungi Kami/i).closest('a');
      expect(waLink).toHaveAttribute(
        'href',
        'https://wa.me/6285710503901'
      );
    });

    test('WhatsApp link opens in new tab', () => {
      renderPage();
      const waLink = screen.getByText(/Hubungi Kami/i).closest('a');
      expect(waLink).toHaveAttribute('target', '_blank');
      expect(waLink).toHaveAttribute('rel', expect.stringContaining('noopener'));
    });
  });

  // ---- PRODUCTION / CAPABILITIES SECTION ----

  describe('Production Section', () => {
    test('renders production section heading', () => {
      renderPage();
      expect(
        screen.getByText('Produk Unggulan Kami')
      ).toBeInTheDocument();
    });

    test('renders production section description', () => {
      renderPage();
      expect(
        screen.getByText(
          /Produsen bahan pengolahan makanan melalui bahan organik terpilih/i
        )
      ).toBeInTheDocument();
    });

    test('renders lab research heading', () => {
      renderPage();
      expect(
        screen.getByText('Lab Penelitian & Pengembangan')
      ).toBeInTheDocument();
    });

    test('renders lab research list items', () => {
      renderPage();
      expect(
        screen.getByText('Melalui tahapan analisis bahan')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Menformulasikan racikan presisi')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Melalui pengujian laboratorium dan skala industri'
        )
      ).toBeInTheDocument();
    });

    test('renders industrial scale heading', () => {
      renderPage();
      expect(
        screen.getByText('Penerapan Skala Industri')
      ).toBeInTheDocument();
    });

    test('renders industrial video captions', () => {
      renderPage();
      expect(
        screen.getByText('Proses mixing bahan baku skala industri')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Proses produksi dari hasil mixing bahan baku')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Hasil akhir proses produksi skala industri & QC'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Produksi di PT.Juragan Bakso Kebumen Jawa Tengah'
        )
      ).toBeInTheDocument();
    });

    test('renders all video elements', () => {
      const { container } = renderPage();
      const videos = container.querySelectorAll('video');
      // production, lab, industrial1-3, industrial4 = 6
      expect(videos.length).toBe(6);
    });
  });

  // ---- CERTIFICATIONS SECTION ----

  describe('Certifications Section', () => {
    test('renders certifications heading', () => {
      renderPage();
      expect(
        screen.getByText('Legalitas & Sertifikasi')
      ).toBeInTheDocument();
    });

    test('renders BPOM certification card', () => {
      renderPage();
      expect(screen.getByText('Terdaftar di BPOM')).toBeInTheDocument();
      expect(screen.getByAltText('Logo BPOM')).toBeInTheDocument();
    });

    test('renders Halal MUI certification card', () => {
      renderPage();
      expect(
        screen.getByText('Sertifikasi Halal MUI')
      ).toBeInTheDocument();
      expect(screen.getByAltText('Logo Halal MUI')).toBeInTheDocument();
    });

    test('renders Verified & Certified badges', () => {
      renderPage();
      expect(
        screen.getByText(/Verified & Certified/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/100% Halal Process/i)
      ).toBeInTheDocument();
    });
  });

  // ---- INVENTORY SECTION ----

  describe('Inventory Section', () => {
    test('renders inventory heading', () => {
      renderPage();
      expect(
        screen.getByText('Stock & Inventory')
      ).toBeInTheDocument();
    });

    test('renders inventory management system label', () => {
      renderPage();
      expect(
        screen.getByText('Inventory Management System')
      ).toBeInTheDocument();
    });

    test('renders system online status', () => {
      renderPage();
      expect(screen.getByText('System Online')).toBeInTheDocument();
    });

    test('renders inventory stats cards', () => {
      renderPage();
      expect(screen.getByText('Ready Stock')).toBeInTheDocument();
      expect(screen.getByText('Continuous Supply')).toBeInTheDocument();
      expect(screen.getByText('Processing time')).toBeInTheDocument();
    });

    test('renders logistics image', () => {
      renderPage();
      expect(
        screen.getByAltText('Logistics Center')
      ).toBeInTheDocument();
    });
  });

  // ---- TESTIMONIALS SECTION ----

  describe('Testimonials Section', () => {
    test('renders testimonials heading', () => {
      renderPage();
      expect(screen.getByText('Testimoni Klien')).toBeInTheDocument();
    });

    test('renders testimonials description', () => {
      renderPage();
      expect(
        screen.getByText(
          /Simak respon para konsumen yang sudah menjadi partner bisnis/i
        )
      ).toBeInTheDocument();
    });

    test('renders all three text testimonials', () => {
      renderPage();
      expect(
        screen.getByText(
          /adonan 40kg, menggunakan bio-texture menghasilkan adonan naik 5kg/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /adonan basreng 16kg/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/adonan 15kg, menggunakan bio-texture menghasilkan 22kg/i)
      ).toBeInTheDocument();
    });

    test('renders testimonial names', () => {
      renderPage();
      expect(screen.getByText('Nikman')).toBeInTheDocument();
      // "Konsumen" appears multiple times
      const konsumenElements = screen.getAllByText('Konsumen');
      expect(konsumenElements.length).toBeGreaterThanOrEqual(2);
    });

    test('renders testimonial roles', () => {
      renderPage();
      expect(screen.getByText('Bagian produksi')).toBeInTheDocument();
      expect(
        screen.getByText('Pengusaha warung bakso')
      ).toBeInTheDocument();
    });
  });

  // ---- AUDIO TESTIMONIAL / PLAYER ----

  describe('Audio Testimonial Player', () => {
    test('renders audio testimonial label', () => {
      renderPage();
      expect(screen.getByText('Testimoni Audio')).toBeInTheDocument();
    });

    test('renders audio testimonial quote', () => {
      renderPage();
      expect(
        screen.getByText(
          /Saya sudah coba 15 kg itu, hasilnya menjadi 22 kg/i
        )
      ).toBeInTheDocument();
    });

    test('renders audio testimonial attribution', () => {
      renderPage();
      expect(screen.getByText('Pak Nikman')).toBeInTheDocument();
    });

    test('renders play/pause button with aria-label', () => {
      renderPage();
      expect(
        screen.getByRole('button', { name: /Play\/Pause audio/i })
      ).toBeInTheDocument();
    });

    test('clicking play button triggers audio play', () => {
      renderPage();
      const playBtn = screen.getByRole('button', {
        name: /Play\/Pause audio/i,
      });
      fireEvent.click(playBtn);

      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    test('renders speed control button with initial speed 1x', () => {
      renderPage();
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    test('clicking speed button cycles through speeds', () => {
      renderPage();
      const speedBtn = screen.getByText('1x');
      fireEvent.click(speedBtn);
      expect(screen.getByText('1.25x')).toBeInTheDocument();

      fireEvent.click(screen.getByText('1.25x'));
      expect(screen.getByText('1.5x')).toBeInTheDocument();

      fireEvent.click(screen.getByText('1.5x'));
      expect(screen.getByText('0.75x')).toBeInTheDocument();

      fireEvent.click(screen.getByText('0.75x'));
      expect(screen.getByText('1x')).toBeInTheDocument();
    });

    test('renders volume slider', () => {
      renderPage();
      const slider = screen.getByRole('slider');
      expect(slider).toBeInTheDocument();
      // Default volume is 0.8 => slider value = 80
      expect(slider).toHaveValue('80');
    });

    test('changing volume slider updates value', () => {
      renderPage();
      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: '50' } });
      expect(slider).toHaveValue('50');
    });

    test('renders formatted time displays', () => {
      renderPage();
      // Default times should display 0:00
      const timeTexts = screen.getAllByText('0:00');
      expect(timeTexts.length).toBeGreaterThanOrEqual(2);
    });

    test('renders audio element with correct source', () => {
      const { container } = renderPage();
      const audioEl = container.querySelector('audio');
      expect(audioEl).toBeTruthy();
      const source = audioEl.querySelector('source');
      expect(source).toHaveAttribute('src', '/testimoni.ogg');
      expect(source).toHaveAttribute('type', 'audio/ogg');
    });
  });

  // ---- PARTNERS SECTION ----

  describe('Partners Section', () => {
    test('renders partners heading', () => {
      renderPage();
      expect(
        screen.getByText('Kemitraan Strategis')
      ).toBeInTheDocument();
    });

    test('renders partner company list', () => {
      renderPage();
      expect(
        screen.getByText(/UD\. Sedap Sari \(Tangerang\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/CV\. Ujang Bakso Barokah \(Sukabumi\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/PT\. Cianjur Artha Makmur \(Cianjur\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/PT\. Juragan Bakso \(Jombang\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/UD\. Najwa \(Soreang-Bandung\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/CV\. Lezatku Food Pringsewu/i)
      ).toBeInTheDocument();
    });

    test('renders collaboration message', () => {
      renderPage();
      expect(
        screen.getByText(
          /Tumbuh bersama membangun kolaborasi dalam industri pangan nasional/i
        )
      ).toBeInTheDocument();
    });

    test('renders partnership image', () => {
      renderPage();
      expect(
        screen.getByAltText('Business Partnership')
      ).toBeInTheDocument();
    });
  });

  // ---- CONTACT FORM ----

  describe('Contact Form Section', () => {
    test('renders contact section heading', () => {
      renderPage();
      expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
    });

    test('renders form field labels', () => {
      renderPage();
      expect(screen.getByText(/Nama Lengkap/i)).toBeInTheDocument();
      expect(screen.getByText(/^Email/)).toBeInTheDocument();
      expect(
        screen.getByText(/No\. Telepon \/ WhatsApp/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Pesan \/ Pertanyaan/i)
      ).toBeInTheDocument();
    });

    test('renders form inputs with correct placeholders', () => {
      renderPage();
      expect(
        screen.getByPlaceholderText('Contoh: Budi Santoso')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('budi@email.com')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('+62 8...')
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Tulis pesan Anda di sini...')
      ).toBeInTheDocument();
    });

    test('renders submit button with correct text', () => {
      renderPage();
      expect(screen.getByText('Kirim Pesan')).toBeInTheDocument();
    });

    test('shows validation errors when submitting empty form', async () => {
      renderPage();

      const submitButton = screen.getByText('Kirim Pesan');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Nama wajib diisi')).toBeInTheDocument();
      });
    });

    test('shows email validation error for invalid email', async () => {
      renderPage();

      const nameInput = screen.getByPlaceholderText('Contoh: Budi Santoso');
      const emailInput = screen.getByPlaceholderText('budi@email.com');

      fireEvent.change(nameInput, { target: { value: 'Test' } });
      fireEvent.change(emailInput, { target: { value: 'invalidemail' } });

      const submitButton = screen.getByText('Kirim Pesan');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email tidak valid')).toBeInTheDocument();
      });
    });

    test('submits form successfully and shows success toast', async () => {
      const { toast } = await import('sonner');

      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      renderPage();

      fireEvent.change(
        screen.getByPlaceholderText('Contoh: Budi Santoso'),
        { target: { value: 'Budi Santoso' } }
      );
      fireEvent.change(screen.getByPlaceholderText('budi@email.com'), {
        target: { value: 'budi@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('Tulis pesan Anda di sini...'),
        { target: { value: 'Hello, I want to order' } }
      );

      fireEvent.click(screen.getByText('Kirim Pesan'));

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/contact',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          })
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Pesan berhasil dikirim! Kami akan segera menghubungi Anda.'
        );
      });
    });

    test('shows error toast when form submission fails', async () => {
      const { toast } = await import('sonner');

      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      renderPage();

      fireEvent.change(
        screen.getByPlaceholderText('Contoh: Budi Santoso'),
        { target: { value: 'Budi' } }
      );
      fireEvent.change(screen.getByPlaceholderText('budi@email.com'), {
        target: { value: 'budi@example.com' },
      });
      fireEvent.change(
        screen.getByPlaceholderText('Tulis pesan Anda di sini...'),
        { target: { value: 'Test message' } }
      );

      fireEvent.click(screen.getByText('Kirim Pesan'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // ---- FOOTER ----

  describe('Footer', () => {
    test('renders company name in footer', () => {
      renderPage();
      expect(screen.getByText('CV. Hurode Raya')).toBeInTheDocument();
    });

    test('renders company description in footer', () => {
      renderPage();
      expect(
        screen.getByText(
          /bergerak dibidang pengadaan barang dan jasa/i
        )
      ).toBeInTheDocument();
    });

    test('renders Team IT section', () => {
      renderPage();
      expect(screen.getByText('Team IT')).toBeInTheDocument();
      expect(
        screen.getByText('Dr. Ade Supriatna, MT.')
      ).toBeInTheDocument();
    });

    test('renders contact information', () => {
      renderPage();
      expect(
        screen.getByText(/huroderayaindonesia1@gmail.com/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/\+6285710503901/i)
      ).toBeInTheDocument();
    });

    test('renders copyright with current year', () => {
      renderPage();
      const year = new Date().getFullYear();
      expect(
        screen.getByText(new RegExp(`${year} CV\\. Hurode Raya`))
      ).toBeInTheDocument();
    });
  });

  // ---- CONTENT COMPLETENESS ----

  describe('Content Completeness', () => {
    test('contains all major section headings', () => {
      renderPage();

      expect(
        screen.getByText(
          /Penyedia bahan pengolahan makanan dan minuman/i
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Produk Unggulan Kami')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Legalitas & Sertifikasi')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Stock & Inventory')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Testimoni Klien')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Kemitraan Strategis')
      ).toBeInTheDocument();
      expect(screen.getByText('Hubungi Kami')).toBeInTheDocument();
    });

    test('heading hierarchy is present', () => {
      renderPage();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(5);
    });
  });
});

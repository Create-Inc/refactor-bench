import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContactSection } from './src/app/ContactSection.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Phone: (props) => <svg data-testid="icon-phone" {...props} />,
  Mail: (props) => <svg data-testid="icon-mail" {...props} />,
  MapPin: (props) => <svg data-testid="icon-mappin" {...props} />,
  Globe: (props) => <svg data-testid="icon-globe" {...props} />,
  MessageCircle: (props) => <svg data-testid="icon-message-circle" {...props} />,
  Send: (props) => <svg data-testid="icon-send" {...props} />,
  CheckCircle: (props) => <svg data-testid="icon-check-circle" {...props} />,
}));

// Mock the constants module
vi.mock('@/data/constants', () => ({
  WHATSAPP_NUMBER: '213123456789',
}));

// Mock window.open
const mockWindowOpen = vi.fn();

describe('ContactSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Arabic Language Rendering', () => {
    test('renders section heading in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('تواصل معنا')).toBeInTheDocument();
      expect(screen.getByText('ابدأ رحلتك اليوم')).toBeInTheDocument();
    });

    test('renders subtitle text in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(
        screen.getByText('فريقنا جاهز للرد على استفساراتك')
      ).toBeInTheDocument();
    });

    test('renders contact info labels in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('الهاتف')).toBeInTheDocument();
      expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument();
      expect(screen.getByText('الموقع')).toBeInTheDocument();
      expect(screen.getByText('أوقات العمل')).toBeInTheDocument();
    });

    test('renders form labels in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('الاسم الكامل *')).toBeInTheDocument();
      expect(screen.getByText('رقم الهاتف *')).toBeInTheDocument();
      expect(screen.getByText('نوع الخدمة')).toBeInTheDocument();
      expect(screen.getByText('رسالتك')).toBeInTheDocument();
    });

    test('renders WhatsApp card text in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('واتساب — تواصل فوري')).toBeInTheDocument();
      expect(screen.getByText('الأسرع في الرد')).toBeInTheDocument();
    });

    test('renders submit button text in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('إرسال عبر واتساب')).toBeInTheDocument();
    });
  });

  describe('French Language Rendering', () => {
    test('renders section heading in French', () => {
      render(<ContactSection lang="fr" />);
      expect(screen.getByText('Contactez-nous')).toBeInTheDocument();
      expect(screen.getByText('Commencez Votre Voyage')).toBeInTheDocument();
    });

    test('renders contact info labels in French', () => {
      render(<ContactSection lang="fr" />);
      expect(screen.getByText('Téléphone')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Adresse')).toBeInTheDocument();
      expect(screen.getByText('Horaires')).toBeInTheDocument();
    });

    test('renders form labels in French', () => {
      render(<ContactSection lang="fr" />);
      expect(screen.getByText('Nom Complet *')).toBeInTheDocument();
      expect(screen.getByText('Téléphone *')).toBeInTheDocument();
      expect(screen.getByText('Type de Service')).toBeInTheDocument();
      expect(screen.getByText('Votre Message')).toBeInTheDocument();
    });

    test('renders submit button in French', () => {
      render(<ContactSection lang="fr" />);
      expect(screen.getByText('Envoyer via WhatsApp')).toBeInTheDocument();
    });
  });

  describe('Contact Info Display', () => {
    test('renders WhatsApp link with correct href', () => {
      render(<ContactSection lang="ar" />);
      const whatsappLink = screen.getByText('واتساب — تواصل فوري').closest('a');
      expect(whatsappLink).toHaveAttribute(
        'href',
        'https://wa.me/213123456789'
      );
      expect(whatsappLink).toHaveAttribute('target', '_blank');
    });

    test('displays phone number', () => {
      render(<ContactSection lang="ar" />);
      expect(screen.getByText('+213 XX XX XX XX')).toBeInTheDocument();
    });

    test('displays email address', () => {
      render(<ContactSection lang="ar" />);
      expect(
        screen.getByText('contact@ainmoussa-travel.dz')
      ).toBeInTheDocument();
    });

    test('displays work hours in Arabic', () => {
      render(<ContactSection lang="ar" />);
      expect(
        screen.getByText('السبت — الخميس، 8ص — 6م')
      ).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    test('opens WhatsApp with correct message on valid form submit', () => {
      render(<ContactSection lang="ar" />);

      fireEvent.change(screen.getByPlaceholderText('أدخل اسمك'), {
        target: { value: 'Ahmed' },
      });
      fireEvent.change(screen.getByPlaceholderText('+213 XX XX XX XX'), {
        target: { value: '+213555555' },
      });

      fireEvent.click(screen.getByText('إرسال عبر واتساب'));

      expect(mockWindowOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/213123456789?text='),
        '_blank'
      );
    });

    test('does not open WhatsApp when name is empty', () => {
      render(<ContactSection lang="ar" />);

      // Only fill phone, leave name empty
      fireEvent.change(screen.getByPlaceholderText('+213 XX XX XX XX'), {
        target: { value: '+213555555' },
      });

      // Submit — the browser validation would normally prevent this,
      // but the component also checks form.name && form.phone
      const form = screen.getByText('إرسال عبر واتساب').closest('form');
      fireEvent.submit(form);

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('does not open WhatsApp when phone is empty', () => {
      render(<ContactSection lang="ar" />);

      fireEvent.change(screen.getByPlaceholderText('أدخل اسمك'), {
        target: { value: 'Ahmed' },
      });

      const form = screen.getByText('إرسال عبر واتساب').closest('form');
      fireEvent.submit(form);

      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    test('shows success confirmation after submission', () => {
      render(<ContactSection lang="ar" />);

      fireEvent.change(screen.getByPlaceholderText('أدخل اسمك'), {
        target: { value: 'Ahmed' },
      });
      fireEvent.change(screen.getByPlaceholderText('+213 XX XX XX XX'), {
        target: { value: '+213555555' },
      });

      fireEvent.click(screen.getByText('إرسال عبر واتساب'));

      expect(screen.getByText('تم إرسال طلبك!')).toBeInTheDocument();
      expect(
        screen.getByText('سيتواصل معك فريقنا قريباً')
      ).toBeInTheDocument();
    });

    test('hides success message after 4 seconds', () => {
      render(<ContactSection lang="ar" />);

      fireEvent.change(screen.getByPlaceholderText('أدخل اسمك'), {
        target: { value: 'Ahmed' },
      });
      fireEvent.change(screen.getByPlaceholderText('+213 XX XX XX XX'), {
        target: { value: '+213555555' },
      });

      fireEvent.click(screen.getByText('إرسال عبر واتساب'));
      expect(screen.getByText('تم إرسال طلبك!')).toBeInTheDocument();

      vi.advanceTimersByTime(4000);

      // After timeout the form should reappear
      expect(screen.queryByText('تم إرسال طلبك!')).not.toBeInTheDocument();
      expect(screen.getByText('إرسال عبر واتساب')).toBeInTheDocument();
    });

    test('includes service and message in WhatsApp URL', () => {
      render(<ContactSection lang="ar" />);

      fireEvent.change(screen.getByPlaceholderText('أدخل اسمك'), {
        target: { value: 'Fatima' },
      });
      fireEvent.change(screen.getByPlaceholderText('+213 XX XX XX XX'), {
        target: { value: '+213777' },
      });

      // Select a service
      const serviceSelect = screen.getByRole('combobox');
      fireEvent.change(serviceSelect, { target: { value: 'حجز فندق' } });

      fireEvent.click(screen.getByText('إرسال عبر واتساب'));

      const call = mockWindowOpen.mock.calls[0][0];
      expect(call).toContain('Fatima');
      expect(call).toContain(encodeURIComponent('حجز فندق'));
    });
  });

  describe('Service Dropdown', () => {
    test('renders all service options in Arabic', () => {
      render(<ContactSection lang="ar" />);
      const select = screen.getByRole('combobox');
      const options = select.querySelectorAll('option');
      // 1 placeholder + 6 services = 7
      expect(options.length).toBe(7);
    });

    test('renders service options in French when lang is fr', () => {
      render(<ContactSection lang="fr" />);
      expect(screen.getByText("Billet d'Avion", { exact: false })).toBeInTheDocument();
      expect(screen.getByText('Package Touristique', { exact: false })).toBeInTheDocument();
    });
  });
});

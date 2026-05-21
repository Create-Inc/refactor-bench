import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from '.app/page.jsx';

describe('HomePage Component', () => {
  describe('Hero Section', () => {
    test('renders main heading with correct text', () => {
      render(<HomePage />);
      expect(
        screen.getByRole('heading', { name: /Stay Focused/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Hit Your Goals/i })
      ).toBeInTheDocument();
    });

    test('renders hero description text', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Plan your day, stay accountable/i)
      ).toBeInTheDocument();
    });

    test('renders hero CTA buttons', () => {
      render(<HomePage />);
      expect(screen.getAllByText('Get Started Free')[0]).toBeInTheDocument();
      expect(screen.getByText('Watch Demo')).toBeInTheDocument();
    });

    test('renders app mockup with FocusMate branding', () => {
      render(<HomePage />);
      expect(screen.getByText('FocusMate')).toBeInTheDocument();
    });

    test('renders app mockup sections', () => {
      render(<HomePage />);
      expect(screen.getByText("Today's Focus")).toBeInTheDocument();
      expect(screen.getByText('Time Blocks')).toBeInTheDocument();
      expect(screen.getByText('Current Streak')).toBeInTheDocument();
    });

    test('renders task examples in mockup', () => {
      render(<HomePage />);
      expect(screen.getByText('Morning workout')).toBeInTheDocument();
      expect(screen.getByText('Project review')).toBeInTheDocument();
      expect(screen.getByText('Team meeting')).toBeInTheDocument();
    });

    test('renders time block examples', () => {
      render(<HomePage />);
      expect(screen.getByText('9:00 - 11:00 AM')).toBeInTheDocument();
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
      expect(screen.getByText('2:00 - 3:30 PM')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();
    });

    test('renders streak counter', () => {
      render(<HomePage />);
      expect(screen.getByText('7🔥')).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    test('renders bold CTA with correct messaging', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Join thousands of people planning better days/i)
      ).toBeInTheDocument();
    });

    test('renders Try It Free button', () => {
      render(<HomePage />);
      expect(screen.getByText('Try It Free')).toBeInTheDocument();
    });
  });

  describe('Pricing Section', () => {
    test('renders pricing section heading', () => {
      render(<HomePage />);
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
    });

    test('renders all three pricing tiers', () => {
      render(<HomePage />);
      expect(screen.getByText('Free')).toBeInTheDocument();
      expect(screen.getByText('Pro')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
    });

    test('renders pricing amounts', () => {
      render(<HomePage />);
      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('$12')).toBeInTheDocument();
      expect(screen.getByText('$30')).toBeInTheDocument();
    });

    test('highlights Pro plan as most popular', () => {
      render(<HomePage />);
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    test('renders Start Free Trial buttons', () => {
      render(<HomePage />);
      const buttons = screen.getAllByText('Start Free Trial');
      expect(buttons.length).toBeGreaterThan(0);
    });

    test('renders pricing features', () => {
      render(<HomePage />);
      expect(screen.getByText(/Up to 3 daily goals/i)).toBeInTheDocument();
      expect(screen.getByText(/Unlimited daily goals/i)).toBeInTheDocument();
      expect(screen.getByText(/Everything in Pro/i)).toBeInTheDocument();
    });
  });

  describe('Sign Up Form Section', () => {
    test('renders form section heading', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Start planning your day in under a minute/i)
      ).toBeInTheDocument();
    });

    test('renders form with name input', () => {
      render(<HomePage />);
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter your full name')
      ).toBeInTheDocument();
    });

    test('renders form with email input', () => {
      render(<HomePage />);
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter your email address')
      ).toBeInTheDocument();
    });

    test('form inputs have correct types and names', () => {
      render(<HomePage />);
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');

      expect(nameInput).toHaveAttribute('type', 'text');
      expect(nameInput).toHaveAttribute('name', 'name');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('name', 'email');
    });

    test('renders submit button', () => {
      render(<HomePage />);
      const submitButtons = screen.getAllByText('Get Started Free');
      expect(submitButtons.length).toBeGreaterThan(1); // One in hero, one in form
    });

    test('shows no credit card required message', () => {
      render(<HomePage />);
      expect(screen.getByText(/No credit card required/i)).toBeInTheDocument();
    });
  });

  describe('Free Checklist Section', () => {
    test('renders checklist section heading', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Get our free productivity checklist/i)
      ).toBeInTheDocument();
    });

    test('renders checklist email input', () => {
      render(<HomePage />);
      const emailInputs = screen.getAllByPlaceholderText(/Enter your email/i);
      expect(emailInputs.length).toBeGreaterThan(0);
    });

    test('renders Get Checklist button', () => {
      render(<HomePage />);
      expect(screen.getByText('Get Checklist')).toBeInTheDocument();
    });

    test('shows free download message', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Free download. No spam, ever./i)
      ).toBeInTheDocument();
    });
  });

  describe('How It Works Section', () => {
    test('renders section heading', () => {
      render(<HomePage />);
      expect(screen.getByText('How FocusMate Works')).toBeInTheDocument();
    });

    test('renders all three steps', () => {
      render(<HomePage />);
      expect(screen.getByText('Make a Plan')).toBeInTheDocument();
      expect(screen.getByText('Time-Block Your Tasks')).toBeInTheDocument();
      expect(screen.getByText('Track Your Progress')).toBeInTheDocument();
    });

    test('renders step numbers', () => {
      render(<HomePage />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('renders step descriptions', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Set your daily goals and priorities/i)
      ).toBeInTheDocument();
      expect(
        screen.getAllByText(/Schedule focused work sessions/i)[0]
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Build streaks, celebrate wins/i)
      ).toBeInTheDocument();
    });
  });

  describe('Features Section', () => {
    test('renders features section heading', () => {
      render(<HomePage />);
      expect(
        screen.getByText('Everything You Need to Stay Productive')
      ).toBeInTheDocument();
    });

    test('renders all six feature cards', () => {
      render(<HomePage />);
      expect(screen.getByText('Daily Planning')).toBeInTheDocument();
      expect(screen.getByText('Time Blocking')).toBeInTheDocument();
      expect(screen.getByText('Streak Tracker')).toBeInTheDocument();
      expect(screen.getByText('Daily Reminders')).toBeInTheDocument();
      expect(screen.getByText('Progress Reports')).toBeInTheDocument();
      expect(screen.getByText('Social Accountability')).toBeInTheDocument();
    });

    test('renders feature descriptions', () => {
      render(<HomePage />);
      expect(screen.getByText(/Set up to 10 daily goals/i)).toBeInTheDocument();
      expect(
        screen.getAllByText(/Break your day into manageable/i)[0]
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Build momentum with visual streak/i)
      ).toBeInTheDocument();
    });
  });

  describe('User Types Section', () => {
    test('renders section heading', () => {
      render(<HomePage />);
      expect(
        screen.getByText('Built for Every Type of Goal-Getter')
      ).toBeInTheDocument();
    });

    test('renders all three user type cards', () => {
      render(<HomePage />);
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Freelancers')).toBeInTheDocument();
      expect(screen.getByText('Developers')).toBeInTheDocument();
    });

    test('renders user type descriptions', () => {
      render(<HomePage />);
      expect(
        screen.getByText(/Balance coursework, assignments/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Manage multiple client projects/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Schedule deep coding sessions/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('all buttons have explicit type attributes', () => {
      render(<HomePage />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAttribute('type');
      });
    });

    test('form labels are properly associated with inputs', () => {
      render(<HomePage />);
      const nameInput = screen.getByLabelText('Full Name');
      const emailInput = screen.getByLabelText('Email Address');

      expect(nameInput).toBeInTheDocument();
      expect(emailInput).toBeInTheDocument();
    });

    test('heading hierarchy is present', () => {
      render(<HomePage />);
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe('Content Completeness', () => {
    test('component renders without crashing', () => {
      expect(() => render(<HomePage />)).not.toThrow();
    });

    test('contains all major sections', () => {
      render(<HomePage />);

      // Verify presence of key content from each section
      expect(
        screen.getByRole('heading', { name: /Stay Focused/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
      expect(screen.getByText('How FocusMate Works')).toBeInTheDocument();
      expect(
        screen.getByText('Everything You Need to Stay Productive')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Built for Every Type of Goal-Getter')
      ).toBeInTheDocument();
    });
  });
});

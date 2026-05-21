import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Mobile App - Tips Screen Refactoring', () => {
  test('renders the main header and subtitle', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    expect(screen.getByText('Beauty Tips')).toBeTruthy();
    expect(
      screen.getByText('Learn from experts and improve your skills')
    ).toBeTruthy();
  });

  test('renders all four category buttons with correct counts', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    // Check all categories are rendered
    expect(screen.getByText('Skincare')).toBeTruthy();
    expect(screen.getByText('24 tips')).toBeTruthy();

    expect(screen.getByText('Makeup')).toBeTruthy();
    expect(screen.getByText('32 tips')).toBeTruthy();

    expect(screen.getByText('Hair')).toBeTruthy();
    expect(screen.getByText('18 tips')).toBeTruthy();

    expect(screen.getByText('Nails')).toBeTruthy();
    expect(screen.getByText('12 tips')).toBeTruthy();
  });

  test('renders all three beauty tips with titles', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    expect(screen.getByText('Perfect Winged Eyeliner in 3 Steps')).toBeTruthy();
    expect(
      screen.getByText('How to Make Your Lipstick Last All Day')
    ).toBeTruthy();
    expect(screen.getByText('Natural Glowing Skin Routine')).toBeTruthy();
  });

  test('displays correct metadata for each tip', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    // Check first tip metadata
    expect(screen.getByText('Beginner')).toBeTruthy();
    expect(screen.getByText('5 min')).toBeTruthy();
    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText('By Sarah M. • Tutorial')).toBeTruthy();

    // Check second tip metadata
    expect(screen.getByText('Easy')).toBeTruthy();
    expect(screen.getByText('3 min')).toBeTruthy();
    expect(screen.getByText('4.6')).toBeTruthy();
    expect(screen.getByText('By Jessica L. • Tip')).toBeTruthy();

    // Check third tip metadata
    expect(screen.getByText('Intermediate')).toBeTruthy();
    expect(screen.getByText('8 min')).toBeTruthy();
    expect(screen.getByText('4.9')).toBeTruthy();
    expect(screen.getByText('By Emma K. • Guide')).toBeTruthy();
  });

  test('displays correct tip types as badges', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    // Check for type badges (they appear twice - once in metadata, once as badge)
    const tutorialElements = screen.getAllByText('Tutorial');
    expect(tutorialElements.length).toBeGreaterThan(0);

    const tipElements = screen.getAllByText('Tip');
    expect(tipElements.length).toBeGreaterThan(0);

    const guideElements = screen.getAllByText('Guide');
    expect(guideElements.length).toBeGreaterThan(0);
  });

  test('renders search input with correct placeholder', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    const searchInput = screen.getByPlaceholderText(
      'Search tips and tutorials...'
    );
    expect(searchInput).toBeTruthy();
  });

  test('renders "Popular Tips" section header', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    render(<TipsScreen />);

    expect(screen.getByText('Popular Tips')).toBeTruthy();
    expect(screen.getByText('View all')).toBeTruthy();
  });

  test('component is a valid function that can be instantiated', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    expect(TipsScreen).toBeDefined();
    expect(typeof TipsScreen).toBe('function');
  });

  test('renders without crashing and produces output', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    const { container } = render(<TipsScreen />);
    expect(container).toBeTruthy();
    expect(container.innerHTML.length).toBeGreaterThan(100);
  });

  test('can be rendered multiple times without errors', async () => {
    const TipsModule = await import('./app/(tabs)/tips.jsx');
    const TipsScreen = TipsModule.default;

    const { rerender } = render(<TipsScreen />);
    expect(() => rerender(<TipsScreen />)).not.toThrow();
    expect(() => rerender(<TipsScreen />)).not.toThrow();
  });
});

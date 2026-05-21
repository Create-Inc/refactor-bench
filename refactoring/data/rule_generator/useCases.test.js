import { describe, test, expect } from 'vitest';
import { generateUseCasePages } from './src/app/useCases.js';

describe('generateUseCasePages', () => {
  let collectedPages;

  // Collect all pages before tests run
  function collectPages() {
    const pages = [];
    generateUseCasePages((page) => pages.push(page));
    return pages;
  }

  test('should call addPage for each use case', () => {
    const pages = collectPages();
    expect(pages.length).toBeGreaterThan(0);
  });

  test('should generate at least 20 use case pages', () => {
    const pages = collectPages();
    expect(pages.length).toBeGreaterThanOrEqual(20);
  });

  test('each page should have a slug string', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.slug).toBe('string');
      expect(page.slug.length).toBeGreaterThan(0);
      // slugs should be kebab-case (lowercase with hyphens)
      expect(page.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    });
  });

  test('slugs should be unique', () => {
    const pages = collectPages();
    const slugs = pages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test('each page should have action and actionId', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.action).toBe('string');
      expect(page.action.length).toBeGreaterThan(0);
      expect(typeof page.actionId).toBe('string');
      expect(page.actionId.length).toBeGreaterThan(0);
    });
  });

  test('each page should have fileType and fileTypeLabel', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.fileType).toBe('string');
      expect(page.fileType.length).toBeGreaterThan(0);
      expect(typeof page.fileTypeLabel).toBe('string');
      // fileTypeLabel should be uppercase version of fileType
      expect(page.fileTypeLabel).toBe(page.fileType.toUpperCase());
    });
  });

  test('each page should have targetKB as a positive number and targetLabel as a string', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.targetKB).toBe('number');
      expect(page.targetKB).toBeGreaterThan(0);
      expect(typeof page.targetLabel).toBe('string');
      expect(page.targetLabel.length).toBeGreaterThan(0);
    });
  });

  test('each page should have platform set to null (generic use cases)', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(page.platform).toBeNull();
      expect(page.platformId).toBeNull();
      expect(page.platformType).toBeNull();
    });
  });

  test('each page should have isGeneric set to true', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(page.isGeneric).toBe(true);
    });
  });

  test('each page should have commonErrors as a non-empty array', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(Array.isArray(page.commonErrors)).toBe(true);
      expect(page.commonErrors.length).toBeGreaterThan(0);
      page.commonErrors.forEach((err) => {
        expect(typeof err).toBe('string');
      });
    });
  });

  test('each page should have tips as a non-empty array', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(Array.isArray(page.tips)).toBe(true);
      expect(page.tips.length).toBeGreaterThan(0);
      page.tips.forEach((tip) => {
        expect(typeof tip).toBe('string');
      });
    });
  });

  test('each page should have a customTitle derived from the slug', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.customTitle).toBe('string');
      expect(page.customTitle.length).toBeGreaterThan(0);
      // customTitle should be title-cased version of slug
      // Every word should start with uppercase
      const words = page.customTitle.split(' ');
      words.forEach((word) => {
        expect(word[0]).toBe(word[0].toUpperCase());
      });
    });
  });

  test('each page should have whySizeLimits as a non-empty string', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.whySizeLimits).toBe('string');
      expect(page.whySizeLimits.length).toBeGreaterThan(0);
    });
  });

  test('each page should have platformAudience and platformDescription', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.platformAudience).toBe('string');
      expect(page.platformAudience.length).toBeGreaterThan(0);
      expect(typeof page.platformDescription).toBe('string');
      expect(page.platformDescription.length).toBeGreaterThan(0);
    });
  });

  test('each page should have gerund string', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(typeof page.gerund).toBe('string');
      expect(page.gerund.length).toBeGreaterThan(0);
    });
  });

  test('nullable fields should be null', () => {
    const pages = collectPages();
    pages.forEach((page) => {
      expect(page.formats).toBeNull();
      expect(page.dpi).toBeNull();
      expect(page.dimensions).toBeNull();
      expect(page.platformUrl).toBeNull();
    });
  });

  test('addPage callback receives well-formed objects consistently', () => {
    const pages = collectPages();
    const requiredKeys = [
      'slug', 'action', 'actionId', 'gerund', 'fileType', 'fileTypeLabel',
      'platform', 'platformId', 'platformType', 'platformAudience',
      'platformDescription', 'whySizeLimits', 'targetKB', 'targetLabel',
      'formats', 'dpi', 'dimensions', 'commonErrors', 'tips',
      'platformUrl', 'isGeneric', 'customTitle',
    ];
    pages.forEach((page) => {
      requiredKeys.forEach((key) => {
        expect(page).toHaveProperty(key);
      });
    });
  });
});

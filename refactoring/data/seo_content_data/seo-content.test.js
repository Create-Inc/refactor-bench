import { describe, test, expect } from 'vitest';
import {
  generatePageTitle,
  generateMetaDescription,
  generateH1,
  generateIntro,
  generateWhySizeLimitsSection,
  generateStepByStep,
  generateTipsSection,
  generateFAQs,
  generateSchemaWebApp,
  generateSchemaFAQ,
  generateSchemaHowTo,
} from './src/app/seo-content.js';

// Shared test tool fixtures
const platformTool = {
  action: 'Compress',
  fileType: 'pdf',
  fileTypeLabel: 'PDF',
  targetLabel: '5mb',
  platform: 'Canvas LMS',
  slug: 'compress-pdf-for-canvas',
  customTitle: null,
  formats: ['pdf'],
  gerund: 'Compression',
  whySizeLimits: 'Canvas enforces upload limits for server storage.',
  tips: ['Flatten layers'],
};

const genericTool = {
  action: 'Reduce',
  fileType: 'image',
  fileTypeLabel: 'Image',
  targetLabel: '1mb',
  platform: null,
  slug: 'reduce-image-under-1mb',
  customTitle: null,
  formats: ['jpg', 'png'],
  gerund: 'Reduction',
  tips: [],
};

const customTitleTool = {
  action: 'Compress',
  fileType: 'pdf',
  fileTypeLabel: 'PDF',
  targetLabel: '10mb',
  platform: null,
  slug: 'compress-pdf-custom',
  customTitle: 'My Custom Title',
  formats: null,
  tips: [],
};

describe('SEO Content Generator Functions', () => {
  describe('generatePageTitle', () => {
    test('should use customTitle when provided, include platform when set, or fall back to generic', () => {
      const custom = generatePageTitle(customTitleTool);
      expect(custom).toContain('My Custom Title');
      expect(custom).toContain('Free & Instant');

      const withPlatform = generatePageTitle(platformTool);
      expect(withPlatform).toContain('Canvas LMS');
      expect(withPlatform).toContain('5MB');

      const generic = generatePageTitle(genericTool);
      expect(generic).toContain('Image');
      expect(generic).toContain('Free Online Tool');
    });
  });

  describe('generateMetaDescription', () => {
    test('should include platform name for platform tools and be generic otherwise', () => {
      const platform = generateMetaDescription(platformTool);
      expect(typeof platform).toBe('string');
      expect(platform).toContain('Canvas LMS');
      expect(platform.length).toBeGreaterThan(50);

      const generic = generateMetaDescription(genericTool);
      expect(generic).toContain('image');
      expect(generic).not.toContain('null');
    });
  });

  describe('generateH1', () => {
    test('should use customTitle, platform name, or generic format', () => {
      expect(generateH1(customTitleTool)).toBe('My Custom Title');

      const withPlatform = generateH1(platformTool);
      expect(withPlatform).toContain('Canvas LMS');

      const generic = generateH1(genericTool);
      expect(generic).toContain('Image');
      expect(generic).toContain('1MB');
    });
  });

  describe('generateIntro', () => {
    test('should produce long-form text referencing platform or file type', () => {
      const platform = generateIntro(platformTool);
      expect(platform).toContain('Canvas LMS');
      expect(platform.length).toBeGreaterThan(100);

      const generic = generateIntro(genericTool);
      expect(generic).toContain('image');
      expect(generic.length).toBeGreaterThan(100);
    });
  });

  describe('generateWhySizeLimitsSection', () => {
    test('should return object with heading, content, extra', () => {
      const result = generateWhySizeLimitsSection(platformTool);
      expect(result).toHaveProperty('heading');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('extra');
      expect(result.heading).toContain('Canvas LMS');
      expect(result.content).toBe(platformTool.whySizeLimits);
    });

    test('should use fallback content when whySizeLimits is absent', () => {
      const result = generateWhySizeLimitsSection({ ...genericTool, whySizeLimits: undefined });
      expect(result.content).toContain('enforce file size limits');
    });
  });

  describe('generateStepByStep', () => {
    test('should return exactly 4 steps with step number, title, and description', () => {
      const result = generateStepByStep(platformTool);
      expect(result.length).toBe(4);
      result.forEach((step, index) => {
        expect(step.step).toBe(index + 1);
        expect(typeof step.title).toBe('string');
        expect(step.title.length).toBeGreaterThan(0);
        expect(typeof step.description).toBe('string');
        expect(step.description.length).toBeGreaterThan(0);
      });
    });

    test('steps should reference the tool file type and target', () => {
      const result = generateStepByStep(genericTool);
      const allText = result.map((s) => s.title + ' ' + s.description).join(' ');
      expect(allText).toContain('Image');
      expect(allText).toContain('1MB');
    });
  });

  describe('generateTipsSection', () => {
    test('should return at most 8 deduplicated tips', () => {
      const result = generateTipsSection(platformTool);
      expect(result.length).toBeLessThanOrEqual(8);
      expect(result.length).toBeGreaterThan(0);
      const unique = [...new Set(result)];
      expect(result.length).toBe(unique.length);
    });

    test('should produce file-type-specific tips for pdf, image, and video', () => {
      const pdfTips = generateTipsSection({ ...genericTool, fileType: 'pdf', tips: [] });
      expect(pdfTips.length).toBeGreaterThan(0);
      expect(pdfTips.join(' ').toLowerCase()).toContain('pdf');

      const imgTips = generateTipsSection({ ...genericTool, fileType: 'image', tips: [] });
      expect(imgTips.length).toBeGreaterThan(0);

      const videoTips = generateTipsSection({ ...genericTool, fileType: 'video', tips: [] });
      expect(videoTips.length).toBeGreaterThan(0);
    });
  });

  describe('generateFAQs', () => {
    test('should return FAQ objects with question and answer strings', () => {
      const result = generateFAQs(genericTool);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((faq) => {
        expect(typeof faq.question).toBe('string');
        expect(faq.question.length).toBeGreaterThan(0);
        expect(typeof faq.answer).toBe('string');
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });

    test('platform tools should get an extra platform-specific FAQ', () => {
      const platformFAQs = generateFAQs(platformTool);
      const genericFAQs = generateFAQs(genericTool);
      expect(platformFAQs.length).toBeGreaterThan(genericFAQs.length);
      expect(platformFAQs.some((f) => f.question.includes('Canvas LMS'))).toBe(true);
    });
  });

  describe('generateSchemaWebApp', () => {
    test('should produce valid schema.org WebApplication with free offer and correct URL', () => {
      const result = generateSchemaWebApp(platformTool, 'https://example.com');
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('WebApplication');
      expect(result.applicationCategory).toBe('UtilityApplication');
      expect(result.offers.price).toBe('0');
      expect(result.offers.priceCurrency).toBe('USD');
      expect(result.url).toBe('https://example.com/tool/compress-pdf-for-canvas');
      expect(Array.isArray(result.featureList)).toBe(true);
      expect(result.featureList.length).toBeGreaterThan(0);
    });
  });

  describe('generateSchemaFAQ', () => {
    test('should produce valid FAQPage schema with Question/Answer entities', () => {
      const result = generateSchemaFAQ(genericTool);
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('FAQPage');
      expect(result.mainEntity.length).toBeGreaterThan(0);
      result.mainEntity.forEach((entity) => {
        expect(entity['@type']).toBe('Question');
        expect(entity.acceptedAnswer['@type']).toBe('Answer');
      });
    });
  });

  describe('generateSchemaHowTo', () => {
    test('should produce valid HowTo schema with 4 steps and correct URLs', () => {
      const result = generateSchemaHowTo(platformTool, 'https://example.com');
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('HowTo');
      expect(typeof result.name).toBe('string');
      expect(typeof result.description).toBe('string');
      expect(result.step.length).toBe(4);
      result.step.forEach((s) => {
        expect(s['@type']).toBe('HowToStep');
        expect(s.url).toContain('https://example.com/tool/compress-pdf-for-canvas#step-');
      });
    });
  });
});

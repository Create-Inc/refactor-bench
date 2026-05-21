import { describe, test, expect } from 'vitest';
import {
  COLORS,
  HERO_SLIDES,
  INDUSTRIES,
  SERVICES,
  PROCESS_STEPS,
  CASE_STUDIES,
  TESTIMONIALS,
  FAQS,
  METRICS,
  INSIGHTS_ARTICLES,
  CREDIBILITY_ITEMS,
  DIFFERENTIATORS,
  NAV_ITEMS,
} from './src/app/constants.js';

describe('App Constants Module', () => {
  describe('COLORS', () => {
    test('should have navy, gold, charcoal, lightGray as valid hex strings', () => {
      expect(COLORS).toHaveProperty('navy');
      expect(COLORS).toHaveProperty('gold');
      expect(COLORS).toHaveProperty('charcoal');
      expect(COLORS).toHaveProperty('lightGray');
      Object.values(COLORS).forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  describe('HERO_SLIDES', () => {
    test('each slide should have title, description, cta, and gradient bg', () => {
      expect(HERO_SLIDES.length).toBeGreaterThan(0);
      HERO_SLIDES.forEach((slide) => {
        expect(typeof slide.title).toBe('string');
        expect(slide.title.length).toBeGreaterThan(0);
        expect(typeof slide.description).toBe('string');
        expect(typeof slide.cta).toBe('string');
        expect(slide.bg).toContain('gradient');
      });
    });
  });

  describe('INDUSTRIES', () => {
    test('each industry should have name and detail strings', () => {
      expect(INDUSTRIES.length).toBeGreaterThan(0);
      INDUSTRIES.forEach((ind) => {
        expect(typeof ind.name).toBe('string');
        expect(ind.name.length).toBeGreaterThan(0);
        expect(typeof ind.detail).toBe('string');
        expect(ind.detail.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SERVICES', () => {
    test('each service should have title and description strings', () => {
      expect(SERVICES.length).toBeGreaterThan(0);
      SERVICES.forEach((service) => {
        expect(typeof service.title).toBe('string');
        expect(typeof service.description).toBe('string');
      });
    });
  });

  describe('PROCESS_STEPS', () => {
    test('each step should have sequential zero-padded step numbers with title and description', () => {
      expect(PROCESS_STEPS.length).toBeGreaterThan(0);
      PROCESS_STEPS.forEach((step, index) => {
        expect(step.step).toBe(String(index + 1).padStart(2, '0'));
        expect(typeof step.title).toBe('string');
        expect(typeof step.description).toBe('string');
      });
    });
  });

  describe('CASE_STUDIES', () => {
    test('each case study should have company, role, and outcome strings', () => {
      expect(CASE_STUDIES.length).toBeGreaterThan(0);
      CASE_STUDIES.forEach((study) => {
        expect(typeof study.company).toBe('string');
        expect(typeof study.role).toBe('string');
        expect(typeof study.outcome).toBe('string');
        expect(study.outcome.length).toBeGreaterThan(0);
      });
    });
  });

  describe('TESTIMONIALS', () => {
    test('each testimonial should have quote and author strings', () => {
      expect(TESTIMONIALS.length).toBeGreaterThan(0);
      TESTIMONIALS.forEach((t) => {
        expect(typeof t.quote).toBe('string');
        expect(t.quote.length).toBeGreaterThan(0);
        expect(typeof t.author).toBe('string');
        expect(t.author.length).toBeGreaterThan(0);
      });
    });
  });

  describe('FAQS', () => {
    test('each FAQ should have a question ending with ? and a non-empty answer', () => {
      expect(FAQS.length).toBeGreaterThan(0);
      FAQS.forEach((faq) => {
        expect(typeof faq.question).toBe('string');
        expect(faq.question.trim().endsWith('?')).toBe(true);
        expect(typeof faq.answer).toBe('string');
        expect(faq.answer.length).toBeGreaterThan(0);
      });
    });
  });

  describe('METRICS', () => {
    test('each metric should have label and value strings', () => {
      expect(METRICS.length).toBeGreaterThan(0);
      METRICS.forEach((metric) => {
        expect(typeof metric.label).toBe('string');
        expect(typeof metric.value).toBe('string');
      });
    });
  });

  describe('INSIGHTS_ARTICLES', () => {
    test('each article should have title and desc strings', () => {
      expect(INSIGHTS_ARTICLES.length).toBeGreaterThan(0);
      INSIGHTS_ARTICLES.forEach((article) => {
        expect(typeof article.title).toBe('string');
        expect(typeof article.desc).toBe('string');
      });
    });
  });

  describe('CREDIBILITY_ITEMS and NAV_ITEMS', () => {
    test('CREDIBILITY_ITEMS should be non-empty string array', () => {
      expect(CREDIBILITY_ITEMS.length).toBeGreaterThan(0);
      CREDIBILITY_ITEMS.forEach((item) => {
        expect(typeof item).toBe('string');
        expect(item.length).toBeGreaterThan(0);
      });
    });

    test('NAV_ITEMS should start with Home and end with Contact', () => {
      expect(NAV_ITEMS.length).toBeGreaterThan(0);
      expect(NAV_ITEMS[0]).toBe('Home');
      expect(NAV_ITEMS[NAV_ITEMS.length - 1]).toBe('Contact');
      NAV_ITEMS.forEach((item) => {
        expect(typeof item).toBe('string');
      });
    });
  });

  describe('DIFFERENTIATORS', () => {
    test('each differentiator should have title and desc strings', () => {
      expect(DIFFERENTIATORS.length).toBeGreaterThan(0);
      DIFFERENTIATORS.forEach((diff) => {
        expect(typeof diff.title).toBe('string');
        expect(typeof diff.desc).toBe('string');
        expect(diff.desc.length).toBeGreaterThan(0);
      });
    });
  });

  describe('cross-cutting integrity', () => {
    test('no exported constant should be undefined or null', () => {
      [
        COLORS, HERO_SLIDES, INDUSTRIES, SERVICES,
        PROCESS_STEPS, CASE_STUDIES, TESTIMONIALS, FAQS,
        METRICS, INSIGHTS_ARTICLES, CREDIBILITY_ITEMS,
        DIFFERENTIATORS, NAV_ITEMS,
      ].forEach((exp) => {
        expect(exp).toBeDefined();
        expect(exp).not.toBeNull();
      });
    });
  });
});

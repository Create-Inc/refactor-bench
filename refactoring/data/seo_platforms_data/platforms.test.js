import { describe, test, expect } from 'vitest';
import {
  platforms,
  getPlatformById,
  getPlatformsByType,
} from './src/app/platforms.js';

describe('Platforms Data Module', () => {
  describe('platforms array', () => {
    test('should be a non-empty array', () => {
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms.length).toBeGreaterThan(0);
    });

    test('each platform should have required identification fields', () => {
      platforms.forEach((platform) => {
        expect(typeof platform.id).toBe('string');
        expect(platform.id.length).toBeGreaterThan(0);
        expect(typeof platform.name).toBe('string');
        expect(platform.name.length).toBeGreaterThan(0);
        expect(typeof platform.type).toBe('string');
        expect(platform.type.length).toBeGreaterThan(0);
      });
    });

    test('each platform should have audience and description', () => {
      platforms.forEach((platform) => {
        expect(typeof platform.audience).toBe('string');
        expect(platform.audience.length).toBeGreaterThan(0);
        expect(typeof platform.description).toBe('string');
        expect(platform.description.length).toBeGreaterThan(0);
      });
    });

    test('each platform should have whySizeLimits explanation', () => {
      platforms.forEach((platform) => {
        expect(typeof platform.whySizeLimits).toBe('string');
        expect(platform.whySizeLimits.length).toBeGreaterThan(0);
      });
    });

    test('each platform should have limits with valid file type entries', () => {
      platforms.forEach((platform) => {
        expect(typeof platform.limits).toBe('object');
        expect(platform.limits).not.toBeNull();
        const limitKeys = Object.keys(platform.limits);
        expect(limitKeys.length).toBeGreaterThan(0);

        limitKeys.forEach((key) => {
          const limit = platform.limits[key];
          expect(typeof limit.maxMB).toBe('number');
          expect(limit.maxMB).toBeGreaterThan(0);
          expect(typeof limit.maxKB).toBe('number');
          expect(limit.maxKB).toBeGreaterThan(0);
          expect(Array.isArray(limit.formats)).toBe(true);
          expect(limit.formats.length).toBeGreaterThan(0);
        });
      });
    });

    test('maxKB should equal maxMB * 1024 for all limits', () => {
      platforms.forEach((platform) => {
        Object.entries(platform.limits).forEach(([fileType, limit]) => {
          expect(limit.maxKB).toBe(limit.maxMB * 1024);
        });
      });
    });

    test('each platform should have commonErrors as a non-empty array of strings', () => {
      platforms.forEach((platform) => {
        expect(Array.isArray(platform.commonErrors)).toBe(true);
        expect(platform.commonErrors.length).toBeGreaterThan(0);
        platform.commonErrors.forEach((err) => {
          expect(typeof err).toBe('string');
          expect(err.length).toBeGreaterThan(0);
        });
      });
    });

    test('each platform should have tips as a non-empty array of strings', () => {
      platforms.forEach((platform) => {
        expect(Array.isArray(platform.tips)).toBe(true);
        expect(platform.tips.length).toBeGreaterThan(0);
        platform.tips.forEach((tip) => {
          expect(typeof tip).toBe('string');
        });
      });
    });

    test('each platform should have a url string', () => {
      platforms.forEach((platform) => {
        expect(typeof platform.url).toBe('string');
        expect(platform.url).toMatch(/^https?:\/\//);
      });
    });

    test('platform IDs should be unique', () => {
      const ids = platforms.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    test('platform names should be unique', () => {
      const names = platforms.map((p) => p.name);
      expect(new Set(names).size).toBe(names.length);
    });

    test('platform types should be recognized categories', () => {
      const knownTypes = new Set();
      platforms.forEach((p) => knownTypes.add(p.type));
      // There should be at least 2 distinct types
      expect(knownTypes.size).toBeGreaterThanOrEqual(2);
      // Each type should be a non-empty string
      knownTypes.forEach((t) => {
        expect(typeof t).toBe('string');
        expect(t.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getPlatformById', () => {
    test('should return the correct platform for a valid ID', () => {
      const first = platforms[0];
      const result = getPlatformById(first.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(first.id);
      expect(result.name).toBe(first.name);
    });

    test('should return undefined for a non-existent ID', () => {
      const result = getPlatformById('nonexistent-platform-xyz');
      expect(result).toBeUndefined();
    });

    test('should return a platform with the full expected shape', () => {
      const result = getPlatformById(platforms[0].id);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('audience');
      expect(result).toHaveProperty('limits');
      expect(result).toHaveProperty('commonErrors');
      expect(result).toHaveProperty('tips');
    });
  });

  describe('getPlatformsByType', () => {
    test('should return an array of platforms matching the given type', () => {
      const firstType = platforms[0].type;
      const result = getPlatformsByType(firstType);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((p) => {
        expect(p.type).toBe(firstType);
      });
    });

    test('should return an empty array for a non-existent type', () => {
      const result = getPlatformsByType('nonexistent-type-xyz');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    test('total platforms across all types should equal total platform count', () => {
      const allTypes = [...new Set(platforms.map((p) => p.type))];
      let totalFromTypes = 0;
      allTypes.forEach((type) => {
        totalFromTypes += getPlatformsByType(type).length;
      });
      expect(totalFromTypes).toBe(platforms.length);
    });
  });

  describe('data integrity', () => {
    test('no platform should have undefined or null required fields', () => {
      platforms.forEach((platform) => {
        const requiredFields = ['id', 'name', 'type', 'audience', 'description', 'whySizeLimits', 'limits', 'commonErrors', 'tips', 'url'];
        requiredFields.forEach((field) => {
          expect(platform[field]).toBeDefined();
          expect(platform[field]).not.toBeNull();
        });
      });
    });

    test('format arrays should only contain lowercase strings', () => {
      platforms.forEach((platform) => {
        Object.values(platform.limits).forEach((limit) => {
          limit.formats.forEach((fmt) => {
            expect(typeof fmt).toBe('string');
            expect(fmt).toBe(fmt.toLowerCase());
          });
        });
      });
    });
  });
});

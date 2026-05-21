import { describe, test, expect } from 'vitest';
import {
  additionalPlatforms,
  purposes,
  countries,
  professions,
  documentSubtypes,
  extraGenericSizes,
  sizeConversions,
  qualityModifiers,
  devices,
  industries,
  toolTypeModifiers,
  seasonalKeywords,
  errorMessages,
  softwareAlternatives,
  additionalPlatforms2,
  additionalSizeConversions,
  useCaseScenarios,
  operatingSystems,
  dpiTargets,
  dimensionTargets,
  batchKeywords,
  searchIntentVariants,
} from './src/app/long-tail-keywords.js';

describe('Long-Tail Keywords Data Module', () => {
  describe('additionalPlatforms', () => {
    test('each platform should have required fields with correct types', () => {
      expect(additionalPlatforms.length).toBeGreaterThan(0);
      additionalPlatforms.forEach((platform) => {
        expect(typeof platform.id).toBe('string');
        expect(typeof platform.name).toBe('string');
        expect(typeof platform.type).toBe('string');
        expect(typeof platform.audience).toBe('string');
        expect(typeof platform.description).toBe('string');
        expect(Array.isArray(platform.commonErrors)).toBe(true);
        expect(Array.isArray(platform.tips)).toBe(true);
      });
    });

    test('platform limits should have valid maxMB/maxKB/formats entries with KB = MB * 1024', () => {
      additionalPlatforms.forEach((platform) => {
        Object.values(platform.limits).forEach((limit) => {
          expect(typeof limit.maxMB).toBe('number');
          expect(typeof limit.maxKB).toBe('number');
          expect(Array.isArray(limit.formats)).toBe(true);
          expect(limit.maxKB).toBe(limit.maxMB * 1024);
        });
      });
    });

    test('platform IDs should be unique', () => {
      const ids = additionalPlatforms.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('purposes', () => {
    test('each purpose should have id, label, audience, targetKB, targetLabel, desc', () => {
      expect(purposes.length).toBeGreaterThan(0);
      purposes.forEach((purpose) => {
        expect(typeof purpose.id).toBe('string');
        expect(typeof purpose.label).toBe('string');
        expect(typeof purpose.audience).toBe('string');
        expect(typeof purpose.targetKB).toBe('number');
        expect(purpose.targetKB).toBeGreaterThan(0);
        expect(typeof purpose.targetLabel).toBe('string');
        expect(typeof purpose.desc).toBe('string');
      });
    });
  });

  describe('countries', () => {
    test('each country should have unique ID with passport and visa specs', () => {
      expect(countries.length).toBeGreaterThan(0);
      const ids = countries.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      countries.forEach((country) => {
        expect(typeof country.name).toBe('string');
        expect(typeof country.passportKB).toBe('number');
        expect(country.passportKB).toBeGreaterThan(0);
        expect(typeof country.passportDim).toBe('string');
        expect(typeof country.visaKB).toBe('number');
        expect(country.visaKB).toBeGreaterThan(0);
        expect(typeof country.visaDim).toBe('string');
      });
    });
  });

  describe('simple list exports', () => {
    test('professions should have id, label, audience', () => {
      expect(professions.length).toBeGreaterThan(0);
      professions.forEach((prof) => {
        expect(typeof prof.id).toBe('string');
        expect(typeof prof.label).toBe('string');
        expect(typeof prof.audience).toBe('string');
      });
    });

    test('qualityModifiers should have id, label, desc', () => {
      expect(qualityModifiers.length).toBeGreaterThan(0);
      qualityModifiers.forEach((mod) => {
        expect(typeof mod.id).toBe('string');
        expect(typeof mod.label).toBe('string');
        expect(typeof mod.desc).toBe('string');
      });
    });

    test('devices should have id and label', () => {
      expect(devices.length).toBeGreaterThan(0);
      devices.forEach((device) => {
        expect(typeof device.id).toBe('string');
        expect(typeof device.label).toBe('string');
      });
    });

    test('batchKeywords should have id, prefix, desc', () => {
      expect(batchKeywords.length).toBeGreaterThan(0);
      batchKeywords.forEach((kw) => {
        expect(typeof kw.id).toBe('string');
        expect(typeof kw.prefix).toBe('string');
        expect(typeof kw.desc).toBe('string');
      });
    });

    test('searchIntentVariants should have id, prefix, suffix, desc', () => {
      expect(searchIntentVariants.length).toBeGreaterThan(0);
      searchIntentVariants.forEach((v) => {
        expect(typeof v.id).toBe('string');
        expect(v).toHaveProperty('prefix');
        expect(v).toHaveProperty('suffix');
        expect(typeof v.desc).toBe('string');
      });
    });

    test('operatingSystems should have id, label, desc', () => {
      expect(operatingSystems.length).toBeGreaterThan(0);
      operatingSystems.forEach((os) => {
        expect(typeof os.id).toBe('string');
        expect(typeof os.label).toBe('string');
        expect(typeof os.desc).toBe('string');
      });
    });
  });

  describe('documentSubtypes', () => {
    test('each should have id, label, fileType, defaultKB > 0, audience', () => {
      expect(documentSubtypes.length).toBeGreaterThan(0);
      documentSubtypes.forEach((doc) => {
        expect(typeof doc.id).toBe('string');
        expect(typeof doc.label).toBe('string');
        expect(typeof doc.fileType).toBe('string');
        expect(typeof doc.defaultKB).toBe('number');
        expect(doc.defaultKB).toBeGreaterThan(0);
        expect(typeof doc.audience).toBe('string');
      });
    });
  });

  describe('extraGenericSizes', () => {
    test('should be kb/label pairs in ascending kb order', () => {
      expect(extraGenericSizes.length).toBeGreaterThan(0);
      extraGenericSizes.forEach((size) => {
        expect(typeof size.kb).toBe('number');
        expect(size.kb).toBeGreaterThan(0);
        expect(typeof size.label).toBe('string');
      });
      for (let i = 1; i < extraGenericSizes.length; i++) {
        expect(extraGenericSizes[i].kb).toBeGreaterThanOrEqual(extraGenericSizes[i - 1].kb);
      }
    });
  });

  describe('sizeConversions and additionalSizeConversions', () => {
    test('fromKB should always be greater than toKB', () => {
      [...sizeConversions, ...additionalSizeConversions].forEach((conv) => {
        expect(typeof conv.fromKB).toBe('number');
        expect(typeof conv.toKB).toBe('number');
        expect(typeof conv.fromLabel).toBe('string');
        expect(typeof conv.toLabel).toBe('string');
        expect(conv.fromKB).toBeGreaterThan(conv.toKB);
      });
    });
  });

  describe('industries', () => {
    test('each should have unique id, label, audience, fileTypes array, desc', () => {
      expect(industries.length).toBeGreaterThan(0);
      const ids = industries.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      industries.forEach((ind) => {
        expect(typeof ind.label).toBe('string');
        expect(typeof ind.audience).toBe('string');
        expect(Array.isArray(ind.fileTypes)).toBe(true);
        expect(ind.fileTypes.length).toBeGreaterThan(0);
        expect(typeof ind.desc).toBe('string');
      });
    });
  });

  describe('seasonalKeywords', () => {
    test('each should have id, label, fileType, targetKB, targetLabel, audience, desc', () => {
      expect(seasonalKeywords.length).toBeGreaterThan(0);
      seasonalKeywords.forEach((kw) => {
        expect(typeof kw.id).toBe('string');
        expect(typeof kw.label).toBe('string');
        expect(typeof kw.fileType).toBe('string');
        expect(typeof kw.targetKB).toBe('number');
        expect(typeof kw.targetLabel).toBe('string');
        expect(typeof kw.audience).toBe('string');
        expect(typeof kw.desc).toBe('string');
      });
    });
  });

  describe('errorMessages', () => {
    test('each should have id, label, fileTypes array, targetKB, targetLabel, desc', () => {
      expect(errorMessages.length).toBeGreaterThan(0);
      errorMessages.forEach((err) => {
        expect(typeof err.id).toBe('string');
        expect(typeof err.label).toBe('string');
        expect(Array.isArray(err.fileTypes)).toBe(true);
        expect(err.fileTypes.length).toBeGreaterThan(0);
        expect(typeof err.targetKB).toBe('number');
        expect(typeof err.desc).toBe('string');
      });
    });
  });

  describe('additionalPlatforms2', () => {
    test('should have same shape as additionalPlatforms with non-overlapping IDs', () => {
      expect(additionalPlatforms2.length).toBeGreaterThan(0);
      const ids1 = new Set(additionalPlatforms.map((p) => p.id));
      additionalPlatforms2.forEach((platform) => {
        expect(typeof platform.id).toBe('string');
        expect(typeof platform.name).toBe('string');
        expect(platform).toHaveProperty('limits');
        expect(ids1.has(platform.id)).toBe(false);
      });
    });
  });

  describe('dimensionTargets and dpiTargets', () => {
    test('dimensionTargets should have positive width/height and id/label/desc', () => {
      expect(dimensionTargets.length).toBeGreaterThan(0);
      dimensionTargets.forEach((dim) => {
        expect(typeof dim.id).toBe('string');
        expect(dim.width).toBeGreaterThan(0);
        expect(dim.height).toBeGreaterThan(0);
        expect(typeof dim.label).toBe('string');
        expect(typeof dim.desc).toBe('string');
      });
    });

    test('dpiTargets should have positive dpi values', () => {
      expect(dpiTargets.length).toBeGreaterThan(0);
      dpiTargets.forEach((target) => {
        expect(typeof target.id).toBe('string');
        expect(target.dpi).toBeGreaterThan(0);
        expect(typeof target.label).toBe('string');
        expect(typeof target.desc).toBe('string');
      });
    });
  });

  describe('cross-cutting data integrity', () => {
    test('no exported array should contain undefined or null entries', () => {
      const allArrays = [
        additionalPlatforms, purposes, countries, professions,
        documentSubtypes, extraGenericSizes, sizeConversions,
        qualityModifiers, devices, industries, toolTypeModifiers,
        seasonalKeywords, errorMessages, softwareAlternatives,
        additionalPlatforms2, additionalSizeConversions,
        useCaseScenarios, operatingSystems, dpiTargets,
        dimensionTargets, batchKeywords, searchIntentVariants,
      ];
      allArrays.forEach((arr) => {
        expect(Array.isArray(arr)).toBe(true);
        arr.forEach((item) => {
          expect(item).toBeDefined();
          expect(item).not.toBeNull();
        });
      });
    });

    test('all ID fields across all exports should be non-empty strings', () => {
      const arraysWithId = [
        additionalPlatforms, purposes, professions, documentSubtypes,
        qualityModifiers, devices, industries, seasonalKeywords,
        errorMessages, additionalPlatforms2, useCaseScenarios,
        operatingSystems, dpiTargets, dimensionTargets,
        batchKeywords, searchIntentVariants,
      ];
      arraysWithId.forEach((arr) => {
        arr.forEach((item) => {
          expect(typeof item.id).toBe('string');
          expect(item.id.length).toBeGreaterThan(0);
        });
      });
    });
  });
});

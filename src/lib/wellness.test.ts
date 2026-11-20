import { describe, expect, it } from 'vitest';
import { enforceWellnessSafety, wellnessResult } from './wellness';

describe('Educational wellness suggestions', () => {
  it('does not recommend products for requests to diagnose or treat illness', () => {
    expect(enforceWellnessSafety({ medicalConcern: false, products: ['plus'], guides: ['transfer-factor'] }, { goals: 'Quiero tratar mi diabetes', preferences: '' })).toEqual({ medicalConcern: true, products: [], guides: ['suplementos'] });
  });
  it('removes products when the model identifies a medical concern', () => {
    expect(enforceWellnessSafety({ medicalConcern: true, products: ['rio'], guides: ['riovida'] }, { goals: 'Necesito orientación', preferences: '' }).products).toEqual([]);
  });
  it('only accepts existing 4Life products and educational guides', () => {
    expect(wellnessResult.safeParse({ medicalConcern: false, products: ['inventado'], guides: ['suplementos'] }).success).toBe(false);
  });
});
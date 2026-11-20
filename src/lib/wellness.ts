import { z } from 'zod';

export const wellnessInput = z.object({ goals: z.string().trim().min(10).max(1200), preferences: z.string().trim().max(600) });
export const wellnessResult = z.object({
  medicalConcern: z.boolean(),
  products: z.array(z.enum(['plus', 'tri', 'rio', 'stix'])).max(3),
  guides: z.array(z.enum(['transfer-factor', 'riovida', 'suplementos'])).min(1).max(3),
});
export type WellnessResult = z.infer<typeof wellnessResult>;
export const wellnessProducts = [
  { id: 'plus', name: 'Transfer Factor Plus', detail: 'Cápsulas con extractos de calostro bovino y huevo, mezcla de hongos y zinc. Revisa alérgenos en la etiqueta local.' },
  { id: 'tri', name: 'Transfer Factor Tri-Factor', detail: 'Presentación en cápsulas con extractos de calostro bovino y huevo. Revisa alérgenos en la etiqueta local.' },
  { id: 'rio', name: 'RioVida Tri-Factor', detail: 'Presentación líquida de Transfer Factor y frutas. Verifica ingredientes, azúcar y alérgenos en la etiqueta local.' },
  { id: 'stix', name: 'RioVida Stix', detail: 'Presentación en sobres de polvo para preparar. Verifica ingredientes, azúcar y alérgenos en la etiqueta local.' },
] as const;

export function enforceWellnessSafety(result: WellnessResult, input: z.infer<typeof wellnessInput>): WellnessResult {
  const text = `${input.goals} ${input.preferences}`;
  const concern = result.medicalConcern || /diagn[oó]st|curar|tratar|s[ií]ntoma|dolor|enfermedad|c[aá]ncer|diabet|medicamento|embaraz|lactan|alerg|anticoag|menor de edad/i.test(text);
  return { medicalConcern: concern, products: concern ? [] : [...new Set(result.products)], guides: concern ? ['suplementos'] : [...new Set(result.guides)] };
}
import { z } from 'zod';

const optionalText = z.string().trim().min(1).optional().nullable();
const decimalText = z.coerce.number().nonnegative().transform(String);
const optionalDecimalText = z.coerce.number().nonnegative().transform(String).optional().nullable();

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: optionalText,
  sku: z.string().trim().min(1).max(80).optional().nullable(),
  category: z.string().trim().min(2).max(80).default('geral'),
  unit: z.string().trim().min(1).max(40).default('unidade'),
  priceCents: z.coerce.number().int().min(0).default(0),
  stockQuantity: decimalText.default('0'),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

export const createMedicationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  genericName: optionalText,
  category: z.string().trim().min(2).max(80),
  concentration: z.string().trim().min(1).max(80),
  dosageForm: optionalText,
  route: optionalText,
  unit: z.string().trim().min(1).max(40).default('mL'),
  minDose: optionalDecimalText,
  maxDose: optionalDecimalText,
  doseUnit: optionalText,
  notes: optionalText,
  isActive: z.boolean().default(true),
});

export const updateMedicationSchema = createMedicationSchema.partial();

export const createPatientSchema = z.object({
  name: z.string().trim().min(2).max(160),
  age: z.coerce.number().int().min(0).max(130),
  weight: z.coerce.number().positive().transform(String),
  height: z.coerce.number().positive().transform(String),
  sex: z.enum(['M', 'F']),
  asa: z.string().trim().min(4).max(20).default('ASA I'),
  notes: optionalText,
});

export const updatePatientSchema = createPatientSchema.partial();

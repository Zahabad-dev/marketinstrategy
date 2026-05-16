import { z } from 'zod'
import { UserRole, CampaignStatus, ContentType, ContentStatus } from '@/types'

/**
 * User Validation Schemas
 */
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  rol: z.nativeEnum(UserRole).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol: z.nativeEnum(UserRole).optional(),
})

/**
 * Client Validation Schemas
 */
export const createClientSchema = z.object({
  nombreEmpresa: z.string().min(1, 'El nombre de empresa es requerido'),
  contacto: z.string().min(1, 'El contacto es requerido'),
  usuarioId: z.string().uuid('ID de usuario inválido').optional().nullable(),
})

export const updateClientSchema = z.object({
  nombreEmpresa: z.string().min(1).optional(),
  contacto: z.string().optional(),
})

/**
 * Campaign Validation Schemas
 */
export const createCampaignSchema = z.object({
  clienteId: z.string().uuid('ID de cliente inválido'),
  mes: z.number().int().min(1, 'El mes debe ser entre 1 y 12').max(12, 'El mes debe ser entre 1 y 12'),
  anio: z.number().int().min(2020, 'El año debe ser válido'),
  objetivoGeneral: z.string().min(1, 'El objetivo general es requerido'),
  estado: z.nativeEnum(CampaignStatus).optional(),
})

export const updateCampaignSchema = z.object({
  mes: z.number().int().min(1).max(12).optional(),
  anio: z.number().int().min(2020).optional(),
  objetivoGeneral: z.string().min(1).optional(),
  estado: z.nativeEnum(CampaignStatus).optional(),
})

/**
 * Content Validation Schemas
 */
export const createContentSchema = z.object({
  campanaId: z.string().uuid('ID de campaña inválido'),
  fecha: z.string().or(z.date()),
  titulo: z.string().min(1, 'El título es requerido'),
  descripcion: z.string().optional(),
  tipo: z.nativeEnum(ContentType),
  urlReferencia: z.string().optional().or(z.literal('')),
  archivoLocal: z.string().optional(),
  estado: z.nativeEnum(ContentStatus).optional(),
  copy: z.string().optional().nullable(),
  copyV2: z.string().optional().nullable(),
  guion: z.string().optional().nullable(),
  guionV2: z.string().optional().nullable(),
})

export const updateContentSchema = z.object({
  fecha: z.string().or(z.date()).optional(),
  titulo: z.string().min(1).optional(),
  descripcion: z.string().optional(),
  tipo: z.nativeEnum(ContentType).optional(),
  urlReferencia: z.string().optional().or(z.literal('')).nullable(),
  archivoLocal: z.string().optional().nullable(),
  estado: z.nativeEnum(ContentStatus).optional(),
  copy: z.string().optional().nullable(),
  copyV2: z.string().optional().nullable(),
  guion: z.string().optional().nullable(),
  guionV2: z.string().optional().nullable(),
})

/**
 * Query Params Validation
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(1000).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

/**
 * Validate data against schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Safe validation with error handling
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

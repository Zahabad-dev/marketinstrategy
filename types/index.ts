// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  CLIENT = 'CLIENT',
}

// User Interface
export interface User {
  id: string
  nombre: string
  email: string
  password?: string
  rol: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UserUpdateInput = Partial<Omit<User, 'id' | 'createdAt' | 'email' | 'password'>>
export type UserPublic = Omit<User, 'password'>

// Client Interface
export interface Client {
  id: string
  nombreEmpresa: string
  contacto: string
  usuarioId?: string | null // User ID (optional)
  createdAt: Date
  updatedAt: Date
}

export type ClientCreateInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>
export type ClientUpdateInput = Partial<Omit<Client, 'id' | 'createdAt' | 'usuarioId'>>

// Campaign Status
export enum CampaignStatus {
  PLANIFICADA = 'PLANIFICADA',
  EN_PROGRESO = 'EN_PROGRESO',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
}

// Campaign Interface
export interface Campaign {
  id: string
  clienteId: string
  mes: number // 1-12
  anio: number
  objetivoGeneral: string
  estado: CampaignStatus
  createdAt: Date
  updatedAt: Date
}

export type CampaignCreateInput = Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'estado'> & {
  estado?: CampaignStatus
}
export type CampaignUpdateInput = Partial<Omit<Campaign, 'id' | 'createdAt' | 'clienteId'>>

// Content Type
export enum ContentType {
  VIDEO_LINK = 'VIDEO_LINK',
  VIDEO_FILE = 'VIDEO_FILE',
  IMAGEN = 'IMAGEN',
  PDF = 'PDF',
}

// Content Status  
export enum ContentStatus {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  PUBLICADO = 'PUBLICADO',
  RECHAZADO = 'RECHAZADO',
}

// ContenidoCalendarizado Interface
export interface ContenidoCalendarizado {
  id: string
  campanaId: string
  fecha: Date
  titulo: string
  descripcion?: string
  tipo: ContentType
  urlReferencia?: string
  archivoLocal?: string
  estado: ContentStatus
  createdAt: Date
  updatedAt: Date
}

export type ContenidoCalendarizadoCreateInput = Omit<ContenidoCalendarizado, 'id' | 'createdAt' | 'updatedAt' | 'estado' | 'fecha'> & {
  estado?: ContentStatus
  fecha: Date | string
}
export type ContenidoCalendarizadoUpdateInput = Partial<Omit<ContenidoCalendarizado, 'id' | 'createdAt' | 'campanaId' |'fecha' | 'urlReferencia' | 'archivoLocal'>> & {
  fecha?: Date | string
  urlReferencia?: string | null
  archivoLocal?: string | null
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// Auth Types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  nombre: string
  rol?: UserRole
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JWTPayload {
  userId: string
  email: string
  rol: UserRole
  iat?: number
  exp?: number
}

// Pagination
export interface PaginationParams {
  page: number
  perPage: number
}

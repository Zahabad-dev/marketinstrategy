import { NextResponse } from 'next/server'
import { ApiResponse, PaginatedResponse } from '@/types'
import { ZodError } from 'zod'

/**
 * Success response helper
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string | Error,
  status: number = 500
): NextResponse<ApiResponse> {
  const errorMessage = typeof error === 'string' ? error : error.message
  
  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status }
  )
}

/**
 * Validation error response
 */
export function validationErrorResponse(
  error: ZodError
): NextResponse<ApiResponse> {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }))
  
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      message: errors.map(e => `${e.field}: ${e.message}`).join(', '),
    },
    { status: 400 }
  )
}

/**
 * Paginated response helper
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  perPage: number
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  const totalPages = Math.ceil(total / perPage)
  
  return NextResponse.json({
    success: true,
    data: {
      data,
      total,
      page,
      perPage,
      totalPages,
    },
  })
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(
  message: string = 'No autorizado'
): NextResponse<ApiResponse> {
  return errorResponse(message, 401)
}

/**
 * Forbidden response
 */
export function forbiddenResponse(
  message: string = 'Acceso denegado'
): NextResponse<ApiResponse> {
  return errorResponse(message, 403)
}

/**
 * Not found response
 */
export function notFoundResponse(
  resource: string = 'Recurso'
): NextResponse<ApiResponse> {
  return errorResponse(`${resource} no encontrado`, 404)
}

/**
 * Conflict response (duplicate resource)
 */
export function conflictResponse(
  message: string = 'El recurso ya existe'
): NextResponse<ApiResponse> {
  return errorResponse(message, 409)
}

/**
 * Bad request response
 */
export function badRequestResponse(
  message: string = 'Solicitud inválida'
): NextResponse<ApiResponse> {
  return errorResponse(message, 400)
}

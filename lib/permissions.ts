import { UserRole } from '@/types'

/**
 * Role hierarchy for permission checks
 */
const roleHierarchy: Record<UserRole, number> = {
  [UserRole.ADMIN]: 3,
  [UserRole.EDITOR]: 2,
  [UserRole.CLIENT]: 1,
}

/**
 * Check if user has required role or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN
}

/**
 * Check if user is editor or admin
 */
export function isEditorOrAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, UserRole.EDITOR)
}

/**
 * Check if user can access resource
 */
export function canAccessResource(
  userRole: UserRole,
  userId: string,
  resourceOwnerId: string
): boolean {
  // Admins can access everything
  if (isAdmin(userRole)) {
    return true
  }
  
  // Editors can access everything
  if (userRole === UserRole.EDITOR) {
    return true
  }
  
  // Clients can only access their own resources
  return userId === resourceOwnerId
}

/**
 * Check if user can modify resource
 */
export function canModifyResource(
  userRole: UserRole,
  userId: string,
  resourceOwnerId: string
): boolean {
  // Admins can modify everything
  if (isAdmin(userRole)) {
    return true
  }
  
  // Editors can modify everything
  if (userRole === UserRole.EDITOR) {
    return true
  }
  
  // Clients can only modify their own resources
  return userId === resourceOwnerId
}

/**
 * Check if user can delete resource
 */
export function canDeleteResource(
  userRole: UserRole,
  userId: string,
  resourceOwnerId: string
): boolean {
  // Only admins and resource owners can delete
  if (isAdmin(userRole)) {
    return true
  }
  
  return userId === resourceOwnerId
}

/**
 * Get accessible client IDs for user
 * Admins and editors get all, clients get only their own
 */
export function getAccessibleClientFilter(
  userRole: UserRole,
  userId: string
): { usuarioId?: string } | {} {
  if (isEditorOrAdmin(userRole)) {
    return {} // No filter, can see all
  }
  
  return { usuarioId: userId } // Only see own clients
}

/**
 * Get accessible campaign filter for user
 */
export function getAccessibleCampaignFilter(
  userRole: UserRole,
  userId: string
): { clienteId?: string } | {} {
  if (isEditorOrAdmin(userRole)) {
    return {} // No filter, can see all
  }
  
  // Clients see only their campaigns - need to filter by clienteId from their clients
  // This will need to be handled in the API route with a join or subquery
  return {}
}

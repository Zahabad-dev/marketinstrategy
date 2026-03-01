/**
 * Link Detection & Metadata Extraction
 * Detecta automáticamente el tipo de link (YouTube, Vimeo, Drive, TikTok, etc.)
 * y extrae metadata relevante para preview
 */

export type LinkType = 
  | 'YOUTUBE' 
  | 'VIMEO' 
  | 'TIKTOK' 
  | 'GOOGLE_DRIVE' 
  | 'DROPBOX'
  | 'ONEDRIVE'
  | 'INSTAGRAM'
  | 'FACEBOOK'
  | 'TWITTER'
  | 'GENERIC'

export interface LinkMetadata {
  type: LinkType
  url: string
  embedUrl?: string
  videoId?: string
  isEmbeddable: boolean
  platform: string
  thumbnail?: string
}

/**
 * Detecta el tipo de link a partir de la URL
 */
export function detectLinkType(url: string): LinkType {
  const lowerUrl = url.toLowerCase()

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'YOUTUBE'
  }
  if (lowerUrl.includes('vimeo.com')) {
    return 'VIMEO'
  }
  if (lowerUrl.includes('tiktok.com')) {
    return 'TIKTOK'
  }
  if (lowerUrl.includes('drive.google.com') || lowerUrl.includes('docs.google.com')) {
    return 'GOOGLE_DRIVE'
  }
  if (lowerUrl.includes('dropbox.com')) {
    return 'DROPBOX'
  }
  if (lowerUrl.includes('1drv.ms') || lowerUrl.includes('onedrive.live.com')) {
    return 'ONEDRIVE'
  }
  if (lowerUrl.includes('instagram.com')) {
    return 'INSTAGRAM'
  }
  if (lowerUrl.includes('facebook.com') || lowerUrl.includes('fb.watch')) {
    return 'FACEBOOK'
  }
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
    return 'TWITTER'
  }

  return 'GENERIC'
}

/**
 * Extrae ID de video de YouTube
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/,
    /youtube\.com\/embed\/([^&\s?]+)/,
    /youtube\.com\/v\/([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extrae ID de video de Vimeo
 */
export function extractVimeoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extrae ID de video de TikTok
 */
export function extractTikTokId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /tiktok\.com\/v\/(\d+)/,
    /vm\.tiktok\.com\/([a-zA-Z0-9]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extrae ID de archivo de Google Drive
 */
export function extractGoogleDriveId(url: string): string | null {
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /docs\.google\.com\/.*\/d\/([^/]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Obtiene URL de embed para YouTube
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Obtiene URL de embed para Vimeo
 */
export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`
}

/**
 * Obtiene URL de embed para TikTok
 */
export function getTikTokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`
}

/**
 * Obtiene URL de preview para Google Drive
 */
export function getGoogleDrivePreviewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`
}

/**
 * Obtiene thumbnail de YouTube
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  const qualityMap = {
    default: 'default.jpg',
    hq: 'hqdefault.jpg',
    mq: 'mqdefault.jpg',
    sd: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`
}

/**
 * Obtiene metadata completa de un link
 */
export function getLinkMetadata(url: string): LinkMetadata {
  const type = detectLinkType(url)
  let metadata: LinkMetadata = {
    type,
    url,
    isEmbeddable: false,
    platform: type,
  }

  switch (type) {
    case 'YOUTUBE': {
      const videoId = extractYouTubeId(url)
      if (videoId) {
        metadata.videoId = videoId
        metadata.embedUrl = getYouTubeEmbedUrl(videoId)
        metadata.thumbnail = getYouTubeThumbnail(videoId)
        metadata.isEmbeddable = true
        metadata.platform = 'YouTube'
      }
      break
    }

    case 'VIMEO': {
      const videoId = extractVimeoId(url)
      if (videoId) {
        metadata.videoId = videoId
        metadata.embedUrl = getVimeoEmbedUrl(videoId)
        metadata.isEmbeddable = true
        metadata.platform = 'Vimeo'
      }
      break
    }

    case 'TIKTOK': {
      const videoId = extractTikTokId(url)
      if (videoId) {
        metadata.videoId = videoId
        metadata.embedUrl = getTikTokEmbedUrl(videoId)
        metadata.isEmbeddable = true
        metadata.platform = 'TikTok'
      }
      break
    }

    case 'GOOGLE_DRIVE': {
      const fileId = extractGoogleDriveId(url)
      if (fileId) {
        metadata.videoId = fileId
        metadata.embedUrl = getGoogleDrivePreviewUrl(fileId)
        metadata.isEmbeddable = true
        metadata.platform = 'Google Drive'
      }
      break
    }

    case 'INSTAGRAM':
      metadata.platform = 'Instagram'
      metadata.isEmbeddable = false // Instagram embed requires specific embed code
      break

    case 'FACEBOOK':
      metadata.platform = 'Facebook'
      metadata.isEmbeddable = false
      break

    case 'TWITTER':
      metadata.platform = 'Twitter'
      metadata.isEmbeddable = false
      break

    case 'DROPBOX':
      metadata.platform = 'Dropbox'
      metadata.isEmbeddable = false
      break

    case 'ONEDRIVE':
      metadata.platform = 'OneDrive'
      metadata.isEmbeddable = false
      break

    default:
      metadata.platform = 'Enlace Externo'
      metadata.isEmbeddable = false
  }

  return metadata
}

/**
 * Valida si una URL es válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Normaliza URL (agrega https:// si falta)
 */
export function normalizeUrl(url: string): string {
  if (!url) return url
  
  url = url.trim()
  
  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`
  }
  
  return url
}

/**
 * Obtiene el dominio de una URL
 */
export function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * Determina si un link es de video basado en la plataforma
 */
export function isVideoLink(url: string): boolean {
  const type = detectLinkType(url)
  return ['YOUTUBE', 'VIMEO', 'TIKTOK'].includes(type)
}

/**
 * Determina si un link es de archivo/storage
 */
export function isStorageLink(url: string): boolean {
  const type = detectLinkType(url)
  return ['GOOGLE_DRIVE', 'DROPBOX', 'ONEDRIVE'].includes(type)
}

'use client'

import { Modal } from '@/components/ui'
import { ContenidoCalendarizado, ContentType, ContentStatus } from '@/types'
import { getLinkMetadata } from '@/lib/link-detector'
import { X, Calendar, FileText, Image, Video, FileIcon, Link as LinkIcon } from 'lucide-react'

interface ContentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  content: ContenidoCalendarizado | null
  onEdit?: () => void
  canEdit?: boolean
}

const contentTypeConfig = {
  VIDEO_LINK: {
    label: 'Video Link',
    icon: LinkIcon,
    color: 'text-purple-600 bg-purple-100',
  },
  VIDEO_FILE: {
    label: 'Video',
    icon: Video,
    color: 'text-blue-600 bg-blue-100',
  },
  IMAGEN: {
    label: 'Imagen',
    icon: Image,
    color: 'text-green-600 bg-green-100',
  },
  PDF: {
    label: 'PDF',
    icon: FileIcon,
    color: 'text-red-600 bg-red-100',
  },
}

const statusConfig = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800' },
  EN_REVISION: { label: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  APROBADO: { label: 'Aprobado', color: 'bg-green-100 text-green-800' },
  PUBLICADO: { label: 'Publicado', color: 'bg-blue-100 text-blue-800' },
  RECHAZADO: { label: 'Rechazado', color: 'bg-red-100 text-red-800' },
}

export function ContentDetailModal({ isOpen, onClose, content, onEdit, canEdit = false }: ContentDetailModalProps) {
  if (!content) return null

  const typeInfo = contentTypeConfig[content.tipo as ContentType]
  const statusInfo = statusConfig[content.estado as ContentStatus]
  const TypeIcon = typeInfo.icon

  const renderPreview = () => {
    switch (content.tipo) {
      case 'IMAGEN':
        if (content.archivoLocal) {
          return (
            <div className="mt-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={content.archivoLocal}
                alt={content.titulo}
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
          )
        }
        break

      case 'VIDEO_LINK':
        if (content.urlReferencia) {
          const linkData = getLinkMetadata(content.urlReferencia)

          // Si es embeddable, mostrar iframe
          if (linkData.isEmbeddable && linkData.embedUrl) {
            return (
              <div className="mt-4">
                <div className="rounded-lg overflow-hidden bg-black aspect-video">
                  <iframe
                    src={linkData.embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  📺 {linkData.platform}
                </p>
              </div>
            )
          }

          // Fallback a enlace
          return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <a
                href={content.urlReferencia}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Ver en {linkData.platform}
              </a>
            </div>
          )
        }
        break

      case 'VIDEO_FILE':
        if (content.archivoLocal) {
          return (
            <div className="mt-4 rounded-lg overflow-hidden bg-black">
              <video
                src={content.archivoLocal}
                controls
                className="w-full h-auto max-h-96"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          )
        }
        break

      case 'PDF':
        if (content.archivoLocal) {
          return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <a
                href={content.archivoLocal}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
              >
                <FileIcon className="w-4 h-4" />
                Abrir PDF
              </a>
            </div>
          )
        }
        break
    }

    return (
      <div className="mt-4 p-8 bg-gray-50 rounded-lg text-center text-gray-500">
        No hay preview disponible
      </div>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="relative">
        {/* Header con tipo e icono */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.color}`}>
              <TypeIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{content.titulo}</h2>
              <p className="text-sm text-gray-500">{typeInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Fecha y Estado */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            {new Date(content.fecha).toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Descripción */}
        {content.descripcion && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Descripción
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{content.descripcion}</p>
          </div>
        )}

        {/* Preview del contenido */}
        {renderPreview()}

        {/* URL de referencia (si existe y no es video link) */}
        {content.urlReferencia && content.tipo !== 'VIDEO_LINK' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-1">Enlace de referencia</p>
            <a
              href={content.urlReferencia}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline break-all"
            >
              {content.urlReferencia}
            </a>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
            <div>
              <span className="font-semibold">Creado:</span>{' '}
              {new Date(content.createdAt).toLocaleDateString('es-ES')}
            </div>
            <div>
              <span className="font-semibold">Actualizado:</span>{' '}
              {new Date(content.updatedAt).toLocaleDateString('es-ES')}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-6 flex justify-end gap-3">
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Editar
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  )
}

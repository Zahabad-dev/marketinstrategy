/**
 * Seed script to populate database with sample data
 */

import { db } from '@/lib/db'
import { UserModel, ClientModel, CampaignModel, ContentModel } from '@/models'
import { UserRole, CampaignStatus, ContentType, ContentStatus } from '@/types'

async function main() {
  console.log('🌱 Poblando base de datos con datos de ejemplo...\n')

  try {
    // Create admin user
    const admin = await UserModel.create({
      nombre: 'Administrador',
      email: 'admin@marketing.com',
      password: 'admin123',
      rol: UserRole.ADMIN,
    })
    console.log('✅ Usuario ADMIN creado:', admin.email)

    // Create editor user
    const editor = await UserModel.create({
      nombre: 'Editor Marketing',
      email: 'editor@marketing.com',
      password: 'editor123',
      rol: UserRole.EDITOR,
    })
    console.log('✅ Usuario EDITOR creado:', editor.email)

    // Create client user
    const clientUser = await UserModel.create({
      nombre: 'Cliente Demo',
      email: 'cliente@empresa.com',
      password: 'cliente123',
      rol: UserRole.CLIENT,
    })
    console.log('✅ Usuario CLIENT creado:', clientUser.email)

    // Create client companies
    const cliente1 = await ClientModel.create({
      nombreEmpresa: 'TechCorp Solutions',
      contacto: 'Juan Pérez - juan@techcorp.com',
      usuarioId: clientUser.id,
    })
    console.log('✅ Cliente creado:', cliente1.nombreEmpresa)

    const cliente2 = await ClientModel.create({
      nombreEmpresa: 'Fashion Boutique',
      contacto: 'María García - maria@fashion.com',
      usuarioId: clientUser.id,
    })
    console.log('✅ Cliente creado:', cliente2.nombreEmpresa)

    // Create campaigns for March 2026
    const campaign1 = await CampaignModel.create({
      clienteId: cliente1.id,
      mes: 3,
      anio: 2026,
      objetivoGeneral: 'Lanzamiento de nuevo producto SaaS - aumentar awareness en redes sociales',
      estado: CampaignStatus.EN_PROGRESO,
    })
    console.log('✅ Campaña creada para TechCorp - Marzo 2026')

    const campaign2 = await CampaignModel.create({
      clienteId: cliente2.id,
      mes: 3,
      anio: 2026,
      objetivoGeneral: 'Colección primavera - campaña de Instagram y TikTok',
      estado: CampaignStatus.PLANIFICADA,
    })
    console.log('✅ Campaña creada para Fashion Boutique - Marzo 2026')

    // Create content for campaign 1
    await ContentModel.create({
      campanaId: campaign1.id,
      fecha: new Date('2026-03-05'),
      titulo: 'Video demo del producto',
      descripcion: 'Video demostrativo de 60 segundos mostrando características principales',
      tipo: ContentType.VIDEO_LINK,
      urlReferencia: 'https://youtube.com/example',
      estado: ContentStatus.APROBADO,
    })
    console.log('✅ Contenido creado: Video demo')

    await ContentModel.create({
      campanaId: campaign1.id,
      fecha: new Date('2026-03-10'),
      titulo: 'Infografía características',
      descripcion: 'Infografía destacando los 5 beneficios principales',
      tipo: ContentType.IMAGEN,
      archivoLocal: '/uploads/infografia-beneficios.png',
      estado: ContentStatus.EN_REVISION,
    })
    console.log('✅ Contenido creado: Infografía')

    // Create content for campaign 2
    await ContentModel.create({
      campanaId: campaign2.id,
      fecha: new Date('2026-03-08'),
      titulo: 'Catálogo Primavera 2026',
      descripcion: 'PDF con la colección completa de primavera',
      tipo: ContentType.PDF,
      archivoLocal: '/uploads/catalogo-primavera.pdf',
      estado: ContentStatus.PENDIENTE,
    })
    console.log('✅ Contenido creado: Catálogo PDF')

    await db.close()
    console.log('\n✅ Base de datos poblada exitosamente')
    console.log('\n📝 Credenciales de acceso:')
    console.log('   Admin: admin@marketing.com / admin123')
    console.log('   Editor: editor@marketing.com / editor123')
    console.log('   Cliente: cliente@empresa.com / cliente123')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error)
    process.exit(1)
  }
}

main()


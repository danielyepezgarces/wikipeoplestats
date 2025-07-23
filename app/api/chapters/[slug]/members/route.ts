@@ .. @@
 import { getCurrentUser } from '@/lib/auth'

 // Obtener miembros del capítulo
-export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
-  const chapterId = parseInt(params.id)
+export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
+  const chapterSlug = params.slug
+  
+  // Convert slug to ID if needed - you may need to adjust this based on your data structure
+  const chapterId = parseInt(chapterSlug) || await getChapterIdBySlug(chapterSlug)
   if (isNaN(chapterId)) {
-    return NextResponse.json({ error: 'Invalid chapter ID' }, { status: 400 })
+    return NextResponse.json({ error: 'Invalid chapter' }, { status: 400 })
   }

@@ .. @@
 }

 // Añadir miembro al capítulo
-export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
-  const chapterId = parseInt(params.id)
+export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
+  const chapterSlug = params.slug
+  const chapterId = parseInt(chapterSlug) || await getChapterIdBySlug(chapterSlug)
   const user = await getCurrentUser(req)

@@ .. @@
 }

 // Eliminar miembro del capítulo
-export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
-  const chapterId = parseInt(params.id)
+export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
+  const chapterSlug = params.slug
+  const chapterId = parseInt(chapterSlug) || await getChapterIdBySlug(chapterSlug)
   const user = await getCurrentUser(req)

@@ .. @@
   }
 }

+// Helper function to get chapter ID by slug - implement based on your database structure
+async function getChapterIdBySlug(slug: string): Promise<number> {
+  // This is a placeholder - implement actual database lookup
+  const conn = await getConnection()
+  const [rows] = await conn.query('SELECT id FROM chapters WHERE slug = ?', [slug])
+  return rows[0]?.id || 0
+}
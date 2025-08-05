@@ .. @@
 import { Database } from './database'
 import crypto from 'crypto'

+// Importar Database para usar getConnection
+import { getConnection } from './database'
+
 export interface SessionData {
@@ .. @@
 static async getSessionWithUser(sessionToken: string): Promise<UserSession | null> {
-  const conn = await Database.getConnection()
+  const conn = await getConnection()
   console.log("🔍 Validating token:", sessionToken); // <- Log el token recibido
   
   try {
     const [rows] = await conn.execute(`
       SELECT 
         s.*,
         u.username,
         u.email,
         u.avatar_url,
-        GROUP_CONCAT(DISTINCT r.name) as roles,
-        ur.chapter_id
+        GROUP_CONCAT(DISTINCT r.name) as roles
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       LEFT JOIN roles r ON r.id = ur.role_id AND r.is_active = 1
       WHERE s.session_token = ? 
         AND s.is_active = TRUE 
         AND s.expires_at > NOW()
         AND u.is_active = 1
       GROUP BY s.id
       LIMIT 1
     `, [sessionToken])

     console.log("📊 Query results:", rows); // <- Log los resultados
     const sessions = rows as any[]
     if (sessions.length === 0) {
       console.log("❌ No active session found for token");
       return null;
     }

     const session = sessions[0]
     return {
       ...session,
       roles: session.roles ? session.roles.split(',') : []
     }
   } catch (error) {
     console.error("❌ Error in getSessionWithUser:", error); // <- Log errores
     return null;
   } finally {
     conn.release()
   }
 }
-- Migración para actualizar el sistema de sesiones
-- Eliminar JWT y usar session IDs compactos

-- Limpiar sesiones existentes con formato JWT
DELETE FROM sessions WHERE LENGTH(token_hash) > 22;

-- Actualizar estructura de la tabla sessions
ALTER TABLE sessions 
MODIFY COLUMN id VARCHAR(22) NOT NULL,
MODIFY COLUMN token_hash VARCHAR(22) NOT NULL,
ADD COLUMN IF NOT EXISTS last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45),
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_info VARCHAR(255),
ADD COLUMN IF NOT EXISTS origin VARCHAR(255);

-- Actualizar índices
DROP INDEX IF EXISTS idx_token_hash ON sessions;
CREATE INDEX idx_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_expires ON sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_last_activity ON sessions(last_activity);

-- Limpiar sesiones expiradas
DELETE FROM sessions WHERE expires_at <= NOW();

SELECT 'Migration completed successfully' as status;

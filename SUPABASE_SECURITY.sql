-- 🛡️ LifeTracker: Script de Seguridad Supabase (RLS) - VERSION FINAL
-- Corre este script en el SQL Editor de tu Dashboard de Supabase.

-- 1. Habilitar RLS en las tablas reales del proyecto
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sync ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'daily_logs' (Logs diarios de comida, agua, etc)
-- El usuario solo puede ver sus propios logs
CREATE POLICY "Users can only see their own daily logs" ON daily_logs 
FOR SELECT USING (auth.uid() = user_id);

-- El usuario solo puede insertar sus propios logs
CREATE POLICY "Users can only insert their own daily logs" ON daily_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- El usuario solo puede actualizar sus propios logs
CREATE POLICY "Users can only update their own daily logs" ON daily_logs 
FOR UPDATE USING (auth.uid() = user_id);

-- El usuario solo puede borrar sus propios logs
CREATE POLICY "Users can only delete their own daily logs" ON daily_logs 
FOR DELETE USING (auth.uid() = user_id);


-- 3. Políticas para 'user_sync' (Configuración global y sincronización)
-- El usuario solo puede ver su propia configuración
CREATE POLICY "Users can only see their own settings" ON user_sync 
FOR SELECT USING (auth.uid() = user_id);

-- El usuario solo puede insertar su propia configuración
CREATE POLICY "Users can only insert their own settings" ON user_sync 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- El usuario solo puede actualizar su propia configuración
CREATE POLICY "Users can only update their own settings" ON user_sync 
FOR UPDATE USING (auth.uid() = user_id);

-- El usuario solo puede borrar su propia configuración
CREATE POLICY "Users can only delete their own settings" ON user_sync 
FOR DELETE USING (auth.uid() = user_id);

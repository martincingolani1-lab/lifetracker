# Integración con Google Fit / Samsung Health

## 📱 ¿Qué es esto?

Esta integración permite que tu app LifeTracker sincronice automáticamente los pasos diarios desde **Google Fit**, que es compatible con:
- ✅ Samsung Health
- ✅ Fitbit
- ✅ Xiaomi Mi Fit
- ✅ Cualquier app que sincronice con Google Fit

## 🚀 Configuración (5 minutos)

### Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Dale un nombre como "LifeTracker Fitness"

### Paso 2: Habilitar Google Fit API

1. En el menú lateral, ve a **"APIs y servicios" > "Biblioteca"**
2. Busca **"Fitness API"**
3. Haz clic en **"Habilitar"**

### Paso 3: Crear Credenciales OAuth 2.0

1. Ve a **"APIs y servicios" > "Credenciales"**
2. Haz clic en **"Crear credenciales" > "ID de cliente de OAuth 2.0"**
3. Si es la primera vez, configura la pantalla de consentimiento:
   - Tipo: **Externo**
   - Nombre de la app: **LifeTracker**
   - Correo de soporte: tu email
   - Ámbitos: Agrega `https://www.googleapis.com/auth/fitness.activity.read`
   - Usuarios de prueba: Agrega tu email de Google

4. Vuelve a **"Credenciales"** y crea el ID de cliente OAuth:
   - Tipo de aplicación: **Aplicación web**
   - Nombre: **LifeTracker Web Client**
   - Orígenes autorizados de JavaScript:
     ```
     http://localhost:5173
     http://localhost:3000
     ```
   - URIs de redirección autorizadas:
     ```
     http://localhost:5173
     http://localhost:3000
     ```

5. Copia el **Client ID** (termina en `.apps.googleusercontent.com`)

### Paso 4: Crear API Key (Opcional pero recomendado)

1. En **"Credenciales"**, haz clic en **"Crear credenciales" > "Clave de API"**
2. Copia la **API Key**
3. (Opcional) Restringe la clave a la Fitness API

### Paso 5: Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Agrega tus credenciales:

```bash
VITE_GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=TU_API_KEY_AQUI
```

3. **¡IMPORTANTE!** Reinicia el servidor de desarrollo:
```bash
npm run dev
```

## 📖 Cómo Usar

### Conectar Google Fit

1. Ve a la sección **"Hábitos" > "Análisis"** en tu app
2. Verás una tarjeta de **"Google Fit Sync"**
3. Haz clic en **"Conectar"**
4. Autoriza el acceso a tus datos de actividad física
5. ¡Listo! Tus pasos se sincronizarán automáticamente

### Sincronización Automática

- Los pasos se actualizan **automáticamente cada 5 minutos**
- También puedes hacer clic en **"Sincronizar Ahora"** para actualizar manualmente
- El hábito de "Caminar 7k pasos" se actualiza automáticamente con los datos de Google Fit

### Desconectar

Si quieres dejar de sincronizar:
1. Haz clic en **"Desconectar"** en la tarjeta de Google Fit Sync
2. Tus datos locales se mantendrán, pero dejará de sincronizar

## 🔧 Solución de Problemas

### Error: "Token expired"
- Simplemente vuelve a hacer clic en "Conectar"
- Los tokens expiran después de 1 hora por seguridad

### No aparecen los pasos
- Verifica que Samsung Health esté sincronizando con Google Fit
- En Samsung Health: **Configuración > Conectar aplicaciones > Google Fit**
- Puede tomar unos minutos para que los datos se sincronicen

### Error: "Not authorized"
- Asegúrate de haber agregado tu email en "Usuarios de prueba" en Google Cloud Console
- Verifica que la Fitness API esté habilitada

### Los pasos no se actualizan automáticamente
- Verifica que el navegador no esté bloqueando scripts de Google
- Comprueba la consola del navegador (F12) para ver errores

## 🔒 Privacidad y Seguridad

- ✅ Solo se leen datos de pasos (no se escribe nada)
- ✅ Los tokens se almacenan localmente en tu navegador
- ✅ No se envían datos a servidores externos (excepto Google Fit API)
- ✅ Puedes revocar el acceso en cualquier momento

## 📱 Compatibilidad con Samsung Health

Samsung Health sincroniza automáticamente con Google Fit en la mayoría de dispositivos Samsung. Para verificar:

1. Abre **Samsung Health**
2. Ve a **Menú (☰) > Configuración**
3. Busca **"Conectar aplicaciones"** o **"Sincronizar con Google Fit"**
4. Activa la sincronización

Una vez activado, tus pasos de Samsung Health aparecerán en Google Fit y, por lo tanto, en LifeTracker.

## 🎯 Próximos Pasos

Funcionalidades futuras planeadas:
- 🔄 Sincronización de calorías quemadas
- 💓 Frecuencia cardíaca
- 😴 Datos de sueño
- 🏃 Distancia recorrida
- 🚴 Actividades específicas (correr, ciclismo, etc.)

## 🆘 Soporte

Si tienes problemas:
1. Revisa la consola del navegador (F12)
2. Verifica que las variables de entorno estén correctamente configuradas
3. Asegúrate de que la Fitness API esté habilitada en Google Cloud Console
4. Comprueba que tu email esté en la lista de usuarios de prueba

---

**¡Disfruta del tracking automático de pasos!** 🚶‍♂️📊

# Integración Webhook n8n - Centro de Ayuda

## ✅ Implementación Completada

Se ha integrado exitosamente el webhook de n8n en el sistema de chat del Centro de Ayuda (`/help`).

## 🔗 Detalles de la Integración

### **Webhook URL**
```
https://devwebhookn8n.ezequiellamas.com/webhook/97b7304f-badd-4689-87d8-cbf983144850
```

### **Cuándo se Activa**
- ✅ Cada vez que un usuario envía un mensaje en el chat de Help
- ✅ Se activa tanto para mensajes manuales como para preguntas predefinidas
- ✅ Funciona para todos los roles de usuario (Cliente, Team Member, Admin)

## 📤 Estructura del JSON Enviado

Cada vez que se envía un mensaje, se envía un POST request al webhook con la siguiente estructura:

```json
{
  "conversationId": "conv_1704067200000_abc123def",
  "message": "¿Cómo creo un nuevo proyecto?",
  "userId": "user-uuid-from-supabase",
  "userEmail": "usuario@ejemplo.com",
  "userProfile": {
    "id": "profile-uuid",
    "fullName": "Juan Pérez",
    "role": "client"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### **Descripción de Campos**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `conversationId` | ID único generado por sesión de chat | `conv_1704067200000_abc123def` |
| `message` | Contenido del mensaje del usuario | `"¿Cómo funciona el ROI?"` |
| `userId` | ID del usuario de Supabase Auth | `"550e8400-e29b-41d4-a716-446655440000"` |
| `userEmail` | Email del usuario autenticado | `"cliente@empresa.com"` |
| `userProfile.id` | ID del perfil en la tabla profiles | `"660e8400-e29b-41d4-a716-446655440001"` |
| `userProfile.fullName` | Nombre completo del usuario | `"María García"` |
| `userProfile.role` | Rol del usuario | `"admin"`, `"client"`, `"team_member"` |
| `timestamp` | Marca de tiempo ISO del mensaje | `"2024-01-01T15:30:45.123Z"` |

## 🎯 Características Implementadas

### **🔄 Gestión de Estado**
- ✅ **ID de Conversación Único**: Se genera un ID por sesión que persiste durante toda la conversación
- ✅ **Estado Visual**: Indicadores visuales de éxito/error en el envío
- ✅ **Fallback Resiliente**: Si el webhook falla, el chat local sigue funcionando

### **📱 Interfaz de Usuario**
- ✅ **Indicador de Estado**: Muestra que el webhook n8n está integrado
- ✅ **ID de Conversación Visible**: Los usuarios pueden ver su ID de conversación
- ✅ **Estados de Mensaje**: Los mensajes muestran si se enviaron exitosamente o fallaron

### **🛠️ Manejo de Errores**
- ✅ **Logging Detallado**: Todos los eventos se registran en la consola del navegador
- ✅ **Fallback Graceful**: Si el webhook falla, el usuario aún recibe respuestas locales
- ✅ **Indicadores Visuales**: Los mensajes muestran ✓ (enviado) o ✗ (error)

## 🔍 Monitoreo y Debugging

### **Logs en Consola del Navegador**
```javascript
// Cuando se envía al webhook exitosamente:
"Sending to webhook: { url: '...', payload: {...} }"
"Webhook sent successfully"

// Cuando falla el webhook:
"Error sending to webhook: Error: Webhook failed: 500 Internal Server Error"
"Webhook failed, but continuing with bot response"
```

### **Verificación Visual**
1. **Estado del Chat**: Muestra "Webhook n8n integrado" con punto azul
2. **ID de Conversación**: Visible en el sidebar
3. **Estado de Mensajes**: ✓ para éxito, ✗ para error

## 🧪 Pruebas

### **Cómo Probar la Integración**
1. ✅ Ir a `/help` en la aplicación
2. ✅ Enviar cualquier mensaje en el chat
3. ✅ Verificar en las DevTools (F12) → Console que aparezcan los logs
4. ✅ El mensaje debe mostrar ✓ si se envió correctamente

### **Casos de Prueba**
- ✅ **Mensaje Manual**: Escribir un mensaje personalizado
- ✅ **Preguntas Predefinidas**: Usar los botones de "Temas Populares"
- ✅ **Diferentes Roles**: Probar con usuarios Admin, Client, Team Member
- ✅ **Múltiples Mensajes**: Verificar que conserven el mismo `conversationId`

## 🔧 Configuración Técnica

### **Archivos Modificados**
- `src/pages/Help.tsx`: Integración principal del webhook

### **Funciones Nuevas**
- `sendToWebhook()`: Maneja el envío de datos al webhook n8n
- `conversationId`: Estado único por sesión de chat

### **Dependencias**
- No se requieren nuevas dependencias
- Usa `fetch()` nativo del navegador

## 🚨 Consideraciones Importantes

### **Privacidad y Seguridad**
- ✅ Solo se envían datos del usuario autenticado
- ✅ Los mensajes del bot local NO se envían al webhook
- ✅ Se incluye información mínima necesaria para el contexto

### **Rendimiento**
- ✅ **Asíncrono**: No bloquea la interfaz de usuario
- ✅ **Fallback**: Si el webhook es lento/falla, el chat local funciona
- ✅ **Timeout**: Los requests pueden fallar gracefully

### **Escalabilidad**
- ✅ **Stateless**: Cada mensaje es independiente
- ✅ **ID Único**: Permite rastrear conversaciones
- ✅ **Extensible**: Fácil agregar más campos al payload

## 🎉 ¡Listo para Usar!

El webhook está completamente integrado y funcionando. Cada mensaje en el Centro de Ayuda será enviado automáticamente a tu endpoint de n8n con toda la información contextual necesaria.

### **Próximos Pasos Sugeridos**
1. **Configurar n8n**: Procesar los webhooks entrantes
2. **Respuestas Automáticas**: Integrar respuestas del webhook al chat
3. **Analytics**: Usar los datos para métricas de soporte
4. **Notificaciones**: Alertas automáticas para el equipo de soporte

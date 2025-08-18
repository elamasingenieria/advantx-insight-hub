# Configuración de Despliegue para SPA (Single Page Application)

## Problema

El error 404 en rutas como `/help` ocurre porque el servidor web no está configurado para manejar el enrutamiento del lado del cliente (client-side routing) de React Router.

## Soluciones por Plataforma

### 🟢 Netlify
El archivo `public/_redirects` ya está configurado. Simplemente redespliega tu aplicación.

```bash
npm run build
# Subir la carpeta dist/ a Netlify
```

### 🔵 Vercel
El archivo `vercel.json` ya está configurado. Simplemente redespliega tu aplicación.

```bash
npm run build
# O usar Vercel CLI: vercel --prod
```

### 🟠 Apache Server
Copia el archivo `public/.htaccess` a tu directorio de despliegue:

```bash
npm run build
# Asegúrate de que el archivo .htaccess esté en el directorio raíz del servidor
```

### 🟢 Nginx
Usa la configuración en `nginx.conf.example`:

1. Actualiza las rutas de SSL y directorio raíz
2. Copia la configuración a tu archivo nginx.conf
3. Reinicia Nginx:

```bash
npm run build
sudo nginx -t  # Verificar configuración
sudo systemctl reload nginx
```

### 📦 Hosting Genérico
Si usas otro hosting, asegúrate de que:

1. Todas las rutas que no sean archivos físicos redirijan a `/index.html`
2. El servidor sirva el contenido de la carpeta `dist/` después de ejecutar `npm run build`

## Verificación

Después del despliegue, verifica que estas rutas funcionen:

- ✅ https://clientes.advantx.co/
- ✅ https://clientes.advantx.co/auth
- ✅ https://clientes.advantx.co/dashboard
- ✅ https://clientes.advantx.co/help
- ✅ https://clientes.advantx.co/admin/users

## Notas Importantes

1. **Cache del navegador**: Después del despliegue, limpia la cache del navegador o usa Ctrl+F5
2. **DNS**: Los cambios pueden tardar hasta 24 horas en propagarse
3. **HTTPS**: Asegúrate de que tu certificado SSL esté correctamente configurado

## Soporte

Si sigues teniendo problemas, verifica:

1. ¿Qué plataforma de hosting estás usando?
2. ¿Los archivos de configuración están en el lugar correcto?
3. ¿Se aplicaron correctamente las configuraciones del servidor?

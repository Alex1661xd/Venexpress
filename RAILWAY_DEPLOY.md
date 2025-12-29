# Guía de Despliegue en Railway 🚀

Este proyecto está configurado como un monorepo (Frontend + Backend en el mismo repositorio). Sigue estos pasos para desplegarlo en Railway.

## 1. Preparación Inicial
1. Asegúrate de que todo tu código esté subido a **GitHub**.
2. Crea una cuenta en [Railway.app](https://railway.app/).

## 2. Crear Proyecto en Railway
1. En el Dashboard de Railway, haz clic en **+ New Project**.
2. Selecciona **Deploy from GitHub repo**.
3. Busca y selecciona tu repositorio `Venexpress`.
4. Haz clic en **Deploy Now**.
   * *Inicialmente intentará desplegar la raíz y fallará, no te preocupes, lo configuraremos ahora.*

## 3. Configurar el Backend (NestJS)
1. Haz clic en la tarjeta del servicio que se acaba de crear (probablemente se llame como tu repo).
2. Ve a **Settings**.
3. En la sección **Root Directory**, escribe: `backend`
   * Esto es vital para que Railway sepa que este servicio es el backend.
4. Railway detectará automáticamente que es un proyecto Node.js.
   * **Build Command**: `npm run build` (detectado auto)
   * **Start Command**: `npm run start:prod` (detectado auto)
5. Ve a la pestaña **Variables**. Añade las siguientes variables (copia las de tu `.env` local):
   * `DATABASE_URL`: (Tu conexión a PostgreSQL)
   * `JWT_SECRET`: (Tu secreto JWT)
   * `SUPABASE_URL`: (URL de Supabase)
   * `SUPABASE_KEY`: (Key de Supabase)
   * `SUPABASE_SERVICE_ROLE_KEY`: (Key Service Role)
   * `FRONTEND_URL`: `https://dummy-url.com` (Actualizaremos esto en el paso 5)
   * `PORT`: `3000` (Variables de Railway, no hace falta cambiarla, la app se adapta).
6. Ve a la pestaña **Networking** y haz clic en **Generate Domain**.
   * Copia este dominio (ej: `venexpress-backend-production.up.railway.app`). Esta será tu **URL del Backend**.

## 4. Configurar el Frontend (Next.js)
1. Vuelve a la vista del proyecto (Project Graph).
2. Haz clic en **+ New** (arriba a la derecha) -> **GitHub Repo**.
3. Selecciona **EL MISMO repositorio** `Venexpress` otra vez.
   * Esto creará un segundo servicio vinculado al mismo código.
4. Haz clic en la nueva tarjeta del servicio.
5. Ve a **Settings**.
6. En **Root Directory**, escribe: `frontend`
7. Railway detectará que es Next.js.
8. Ve a la pestaña **Variables**. Añade:
   * `NEXT_PUBLIC_API_URL`: **Pega aquí la URL del Backend que copiaste en el paso 3** (asegúrate de que empiece por `https://`).
     * Ejemplo: `https://venexpress-backend-production.up.railway.app`
9. Ve a la pestaña **Networking** y haz clic en **Generate Domain**.
   * Esta será la URL pública de tu aplicación web (ej: `venexpress-frontend.up.railway.app`).

## 5. Conexión Final
1. Copia la URL del Frontend (del paso 4.9).
2. Vuelve a tu servicio de **Backend** -> **Variables**.
3. Actualiza o crea la variable `FRONTEND_URL` y pega la URL del Frontend.
   * Esto permite que el backend acepte peticiones desde tu web (CORS).
4. Railway reiniciará automáticamente el backend.

## ¡Listo! 🎉
Tu aplicación debería estar funcionando en la URL del dominio del Frontend.

---
### Notas Importantes
* **Base de Datos:** Si usas una base de datos local, necesitarás crear una en Railway (Add New -> Database -> PostgreSQL) y conectar la variable `DATABASE_URL` en el backend.
* **Supabase:** Asegúrate de que las credenciales de Supabase en Railway sean correctas.

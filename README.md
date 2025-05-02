# Codeflix Backend API

> **API RESTful** de autenticación de usuarios y gestión de películas.

---

## 📋 Características

1. **Autenticación de usuarios**  
   Funcionalidades completas para registro, inicio de sesión, verificación de correo, cierre de sesión y eliminación de usuarios.

2. **Gestión de películas**  
   Operaciones CRUD para crear, actualizar, eliminar y consultar películas con filtros por género y búsqueda por título.

3. **Seguridad**  
   Hashing de contraseñas con bcrypt, autenticación JWT (cookies httpOnly) y validación de datos con Zod.

4. **Notificaciones por correo**  
   Verificación de cuenta vía **Nodemailer**

---

## ⚙️ Requisitos

- **Node.js** ≥ v18  
- **PostgreSQL** (por ahora estamos usando una base de datos local usando el paquete **db-local**)  
- Cuenta de correo para SMTP (Gmail en este caso, puede usar otro)

---

## 🚀 Instalación y configuración

1. **Clonar repositorio**  
   ```bash
   gh repo clone CodeJairo/codeflix-back
   cd codeflix-back
   ```

2. **Instalar dependencias**  
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**  
   ```bash
   mv .env.template .env
   ```  
   Editar `.env`:
   ```env
   PORT=3000
   API_BASE_URL=http://localhost:3000
   JWT_SECRET_KEY=tu_secreto_largo
   MAILER_SERVICE=gmail      # O el servicio que uses
   MAILER_EMAIL=tu_email@dominio.com
   MAILER_KEY=tu_app_password_o_api_key
   ```

4. **Iniciar servidor**  
   - Desarrollo:
     ```bash
     npm run dev
     ```

---

## 🛠️ Endpoints

### 🔐 Autenticación

| Método | Ruta                   | Descripción                 |
| ------ | ---------------------- | --------------------------- |
| POST   | `/auth/register`       | Registrar usuario           |
| POST   | `/auth/login`          | Iniciar sesión              |
| GET    | `/auth/verify/:token`  | Verificar correo electrónico|
| POST   | `/auth/logout`         | Cerrar sesión               |
| DELETE | `/auth/delete/:id`     | Eliminar usuario (admin)    |

### 🎬 Películas

| Método | Ruta                          | Descripción                   |
| ------ | ----------------------------- | ----------------------------- |
| POST   | `/movie/create`               | Crear película                |
| PATCH  | `/movie/update/:id`           | Actualizar película           |
| DELETE | `/movie/delete/:id`           | Eliminar/desactivar película  |
| GET    | `/movie/get-all`              | Listar todas las películas    |
| GET    | `/movie/get/:id`              | Obtener película por ID       |
| GET    | `/movie/get-by-title?title=…`  | Buscar películas por título   |
| GET    | `/movie/get-all?genre=…`      | Filtrar películas por género  |

---

## 🛠 Solución de problemas

- **Correo no llega**  
  - Verificar `MAILER_EMAIL` y `MAILER_KEY`.  
  - Para Gmail, usar App Password o habilitar “Less Secure Apps”.

- **Errores CORS**  
  - Ajustar `AllowedOrigins` en `middlewares/cors.js`.

- **JWT inválido**  
  - Confirmar `JWT_SECRET_KEY` y configuración de expiración.

---

## 🔮 Futuras mejoras

- Recuperación de contraseña vía email.  
- Control de roles y permisos (RBAC).  
- Migración completa a PostgreSQL con ORM (TypeORM/Prisma).  
- Pruebas automatizadas (unitarias e integrales).  
- Carga y reproducción propia de archivos multimedia.  
- Implementación de streaming y CDN.

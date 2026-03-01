# Guía de Instalación - MarketInStrategy

Esta guía te ayudará a configurar y ejecutar el proyecto en tu entorno local.

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18 o superior
- **Python** 3.10 o superior
- **MySQL** 8.0 o superior
- **Git** (opcional)

## Opción 1: Instalación Manual

### Paso 1: Configurar la Base de Datos

1. Inicia MySQL y crea una base de datos:

```sql
CREATE DATABASE marketinstrategy;
CREATE USER 'marketuser'@'localhost' IDENTIFIED BY 'marketpass';
GRANT ALL PRIVILEGES ON marketinstrategy.* TO 'marketuser'@'localhost';
FLUSH PRIVILEGES;
```

### Paso 2: Configurar el Backend

1. Navega a la carpeta del backend:
```bash
cd backend
```

2. Crea un entorno virtual:
```bash
python -m venv venv
```

3. Activa el entorno virtual:
- **Windows:**
  ```bash
  venv\Scripts\activate
  ```
- **Linux/Mac:**
  ```bash
  source venv/bin/activate
  ```

4. Instala las dependencias:
```bash
pip install -r requirements.txt
```

5. Configura las variables de entorno:
```bash
copy .env.example .env
```

Edita el archivo `.env` con tus credenciales:
```env
DATABASE_URL=mysql+pymysql://marketuser:marketpass@localhost:3306/marketinstrategy
SECRET_KEY=tu-clave-secreta-unica
JWT_SECRET_KEY=tu-jwt-secret-unico
```

6. Inicializa la base de datos:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

7. (Opcional) Crea un usuario administrador:
```bash
python
```
```python
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()
with app.app_context():
    user = User(
        email='admin@example.com',
        first_name='Admin',
        last_name='User',
        role='admin'
    )
    user.set_password('admin123')
    db.session.add(user)
    db.session.commit()
    print("Usuario administrador creado!")
exit()
```

8. Ejecuta el servidor backend:
```bash
python run.py
```

El backend estará disponible en http://localhost:5000

### Paso 3: Configurar el Frontend

1. Abre una nueva terminal y navega a la carpeta del frontend:
```bash
cd frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
```bash
copy .env.example .env
```

4. Ejecuta el servidor de desarrollo:
```bash
npm run dev
```

El frontend estará disponible en http://localhost:5173

## Opción 2: Usando Docker

1. Asegúrate de tener Docker y Docker Compose instalados

2. Desde la raíz del proyecto, ejecuta:
```bash
docker-compose up --build
```

Esto iniciará:
- MySQL en el puerto 3306
- Backend en el puerto 5000
- Frontend en el puerto 5173

## Verificación

Abre tu navegador y visita:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/health

## Credenciales de Prueba

Si creaste el usuario administrador:
- **Email:** admin@example.com
- **Contraseña:** admin123

## Solución de Problemas

### Error de conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Comprueba las credenciales en el archivo `.env`
- Asegúrate de que la base de datos existe

### Error al instalar dependencias de Python
- Actualiza pip: `python -m pip install --upgrade pip`
- En Windows, instala las build tools de Visual Studio

### Puerto ya en uso
- Cambia los puertos en los archivos de configuración:
  - Backend: `run.py` (cambia el puerto 5000)
  - Frontend: `vite.config.js` (cambia el puerto 5173)

## Próximos Pasos

1. Explora el dashboard en http://localhost:5173
2. Crea algunos clientes de prueba
3. Añade campañas para los clientes
4. Revisa el calendario de campañas

## Documentación Adicional

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](./docs/API.md)

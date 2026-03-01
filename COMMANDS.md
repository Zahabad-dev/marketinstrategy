# Comandos Útiles - MarketInStrategy

## Backend (Flask)

### Entorno Virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar (Windows)
venv\Scripts\activate

# Activar (Linux/Mac)
source venv/bin/activate

# Desactivar
deactivate
```

### Instalación y Dependencias

```bash
# Instalar dependencias
pip install -r requirements.txt

# Actualizar requirements
pip freeze > requirements.txt

# Instalar paquete específico
pip install nombre-paquete
```

### Base de Datos

```bash
# Inicializar migraciones
flask db init

# Crear migración
flask db migrate -m "Descripción del cambio"

# Aplicar migraciones
flask db upgrade

# Revertir migración
flask db downgrade

# Ver historial
flask db history
```

### Ejecución

```bash
# Modo desarrollo
python run.py

# Con Flask CLI
flask run

# Especificar puerto
flask run --port 5001

# Modo debug
FLASK_ENV=development flask run
```

### Tests

```bash
# Ejecutar todos los tests
pytest

# Con cobertura
pytest --cov=app tests/

# Test específico
pytest tests/test_app.py

# Con verbosidad
pytest -v
```

## Frontend (React + Vite)

### Instalación

```bash
# Instalar dependencias
npm install

# Instalar paquete específico
npm install nombre-paquete

# Instalar como dev dependency
npm install -D nombre-paquete

# Actualizar dependencias
npm update
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint

# Fix lint errors
npm run lint -- --fix
```

### Tailwind CSS

```bash
# Regenerar Tailwind (si es necesario)
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch
```

## Docker

### Comandos Básicos

```bash
# Construir y ejecutar
docker-compose up --build

# Ejecutar en background
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs

# Ver logs de un servicio específico
docker-compose logs backend

# Seguir logs en tiempo real
docker-compose logs -f

# Reconstruir un servicio específico
docker-compose up -d --build backend
```

### Gestión de Contenedores

```bash
# Listar contenedores activos
docker ps

# Listar todos los contenedores
docker ps -a

# Ejecutar comando en contenedor
docker exec -it marketinstrategy_backend bash

# Ver logs de contenedor
docker logs marketinstrategy_backend
```

### Limpieza

```bash
# Eliminar contenedores detenidos
docker container prune

# Eliminar imágenes no usadas
docker image prune

# Eliminar volúmenes no usados
docker volume prune

# Limpieza completa
docker system prune -a
```

## MySQL

### Conexión

```bash
# Desde terminal
mysql -u marketuser -p marketinstrategy

# Desde Docker
docker exec -it marketinstrategy_db mysql -u marketuser -p
```

### Comandos Útiles

```sql
-- Ver bases de datos
SHOW DATABASES;

-- Usar base de datos
USE marketinstrategy;

-- Ver tablas
SHOW TABLES;

-- Describir tabla
DESCRIBE users;

-- Ver datos
SELECT * FROM users;

-- Crear usuario de prueba (dentro de MySQL)
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('test@example.com', 'hash', 'Test', 'User', 'user');
```

## Git

### Workflow Básico

```bash
# Ver estado
git status

# Añadir cambios
git add .

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin main

# Pull
git pull origin main

# Ver logs
git log --oneline
```

### Ramas

```bash
# Crear rama
git checkout -b nombre-feature

# Cambiar de rama
git checkout main

# Listar ramas
git branch

# Fusionar rama
git merge nombre-feature

# Eliminar rama
git branch -d nombre-feature
```

## Producción

### Backend

```bash
# Ejecutar con Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"

# Con gevent workers
gunicorn -w 4 -k gevent -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend

```bash
# Build optimizado
npm run build

# El contenido de dist/ se puede servir con nginx o cualquier servidor estático
```

## Troubleshooting

### Backend

```bash
# Ver variables de entorno
python -c "from app.config import Config; print(Config.SQLALCHEMY_DATABASE_URI)"

# Test de conexión a BD
python -c "from app import create_app; from app.extensions import db; app=create_app(); app.app_context().push(); print(db.engine.url)"
```

### Frontend

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Ver versión de Node
node --version

# Ver versión de npm
npm --version
```

### MySQL

```bash
# Resetear password de root (si olvidaste)
# 1. Detener MySQL
# 2. Iniciar sin grant tables
# 3. Cambiar password
# 4. Reiniciar normalmente

# Ver usuarios
SELECT user, host FROM mysql.user;

# Ver privilegios
SHOW GRANTS FOR 'marketuser'@'localhost';
```

## Atajos de Desarrollo

### Script de inicio rápido (Windows)

Crear `start-dev.bat`:
```batch
@echo off
start cmd /k "cd backend && venv\Scripts\activate && python run.py"
start cmd /k "cd frontend && npm run dev"
```

### Script de inicio rápido (Linux/Mac)

Crear `start-dev.sh`:
```bash
#!/bin/bash
cd backend && source venv/bin/activate && python run.py &
cd frontend && npm run dev &
```

Hacer ejecutable:
```bash
chmod +x start-dev.sh
```

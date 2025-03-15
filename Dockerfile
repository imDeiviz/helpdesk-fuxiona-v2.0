# Usar la imagen base de Node.js
FROM node:18

# Crear un directorio de trabajo
WORKDIR /usr/src/app

COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar los archivos de la API
COPY api/package*.json ./api/
# Instalar las dependencias de la API
RUN npm install --prefix ./api

# Copiar los archivos de la aplicación web
COPY web/package*.json ./web/
# Instalar las dependencias de la aplicación web
RUN npm install --prefix ./web

# Copiar el resto del código de la API y la aplicación web
COPY api/ ./api/
COPY web/ ./web/

# Exponer los puertos necesarios
EXPOSE 3000 5173

# Comando para iniciar la API
CMD ["npm", "run", "dev", "--prefix", "api"]

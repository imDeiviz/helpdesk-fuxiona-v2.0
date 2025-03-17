# Usa una imagen base de Node.js
FROM node:20.19

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json
COPY api/package.json api/package-lock.json ./api/
COPY web/package.json web/package-lock.json ./web/

# Instala las dependencias del backend
RUN cd api && npm install

# Copia el resto de los archivos de la aplicación
COPY api ./api
COPY web ./web

# Instala las dependencias del frontend
RUN cd web && npm install

# Construye el frontend
RUN cd web && npm run build

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "api/app.js"]

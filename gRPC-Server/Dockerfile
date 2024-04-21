# Usa una imagen base de Node.js
FROM node:14

# Establece el directorio de trabajo en /app
WORKDIR /

# Copia el archivo package.json y package-lock.json al directorio de trabajo
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia todos los archivos del directorio actual al directorio de trabajo
COPY . .

# Expone el puerto en el que el servidor gRPC estará escuchando
EXPOSE 50051

# Comando para ejecutar el servidor gRPC
CMD ["node", "gRPC_server.js"]

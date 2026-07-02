// Servidor SOLO del front. No tiene nada del backend.
// Sirve los archivos estáticos de /public en un puerto distinto al de la API.
const express = require('express');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 5500;
app.listen(PORT, () => console.log(`Front en http://localhost:${PORT}`));

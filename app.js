const express = require('express');
const app = express();

app.use(express.json());

let usuarios = [
  { id: 1, usuario: 'juan', password: '1234', rol: 'admin' },
  { id: 2, usuario: 'ana', password: 'abcd', rol: 'user' }
];

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

app.get('/usuarios', (req, res) => {
  res.json(usuarios);
});

app.get('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  res.json(usuario);
});

app.post('/usuarios', (req, res) => {
  const { usuario, password, rol } = req.body;

  if (!usuario || !password || !rol) {
    return res.status(400).json({ mensaje: 'Faltan datos' });
  }

  const nuevoUsuario = {
    id: usuarios.length ? usuarios[usuarios.length - 1].id + 1 : 1,
    usuario,
    password,
    rol
  };

  usuarios.push(nuevoUsuario);
  res.status(201).json(nuevoUsuario);
});

app.put('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { usuario, password, rol } = req.body;

  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  usuarios[index] = {
    id,
    usuario: usuario ?? usuarios[index].usuario,
    password: password ?? usuarios[index].password,
    rol: rol ?? usuarios[index].rol
  };

  res.json(usuarios[index]);
});

app.delete('/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado' });
  }

  const eliminado = usuarios.splice(index, 1);
  res.json({ mensaje: 'Usuario eliminado', usuario: eliminado[0] });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

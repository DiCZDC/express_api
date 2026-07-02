require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('./middleware/auth');
const { verifyAdmin } = require('./middleware/auth');

const app = express();
app.use(express.json(), cors());
app.use(express.static(path.join(__dirname, 'public')));

// Conexión
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/express-mongo');

// Contador para IDs consecutivos
const Counter = mongoose.model('Counter', new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
}));

async function siguienteId(nombre) {
  const contador = await Counter.findByIdAndUpdate(
    nombre,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return contador.seq;
}

function conIdAutoincremental(schema, nombre) {
  schema.pre('save', async function () {
    if (this.isNew) this._id = await siguienteId(nombre);
  });
  return schema;
}

// Schemas
const usuarioSchema = conIdAutoincremental(new mongoose.Schema({
  _id: Number,
  usuario: String, password: String, rol: String
}), 'usuario');
usuarioSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

const articuloSchema = conIdAutoincremental(new mongoose.Schema({
  _id: Number,
  nombre: String, precio: Number, stock: Number
}), 'articulo');
const Articulo = mongoose.model('Articulo', articuloSchema);

const clienteSchema = conIdAutoincremental(new mongoose.Schema({
  _id: Number,
  nombre: String, email: String, telefono: String
}), 'cliente');
const Cliente = mongoose.model('Cliente', clienteSchema);

app.get('/', (req, res) => {
  res.json({ mensaje: 'API funcionando' });
});

// LOGIN
app.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  const u = await Usuario.findOne({ usuario });
  if (!u || !(await bcrypt.compare(password, u.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const token = jwt.sign(
    { id: u._id, usuario: u.usuario, rol: u.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '2h' }
  );
  res.json({ token });
});

// CRUD USUARIOS
app.get('/usuarios', verifyToken, async (req,res) => res.json(await Usuario.find().select('-password')));
app.get('/usuarios/:id', verifyToken, async (req,res) => {
  const u = await Usuario.findById(req.params.id).select('-password');
  u ? res.json(u) : res.status(404).json({error: "No existe"});
});
app.post('/usuarios', async (req,res) => {
  try {
    const u = await Usuario.create(req.body);
    const { password, ...datos } = u.toObject();
    res.status(201).json(datos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.put('/usuarios/:id', verifyToken, verifyAdmin, async (req,res) => {
  const datos = { ...req.body };
  if (datos.password) datos.password = await bcrypt.hash(datos.password, 10);
  const u = await Usuario.findByIdAndUpdate(req.params.id, datos, {new:true}).select('-password');
  u ? res.json(u) : res.status(404).json({error: "No existe"});
});
app.delete('/usuarios/:id', verifyToken, verifyAdmin, async (req,res) => {
  const r = await Usuario.findByIdAndDelete(req.params.id);
  r ? res.json({mensaje: "Usuario eliminado"}) : res.status(404).json({error: "No existe"});
});

// CRUD ARTÍCULOS
app.get('/articulos', verifyToken, async (req,res) => res.json(await Articulo.find()));
app.post('/articulos', verifyToken, async (req,res) => res.status(201).json(await Articulo.create(req.body)));
app.put('/articulos/:id', verifyToken, verifyAdmin, async (req,res) => res.json(await Articulo.findByIdAndUpdate(req.params.id, req.body, {new:true})));
app.delete('/articulos/:id', verifyToken, verifyAdmin, async (req,res) => res.json(await Articulo.findByIdAndDelete(req.params.id)));

// CRUD CLIENTES
app.get('/clientes', verifyToken, async (req,res) => res.json(await Cliente.find()));
app.post('/clientes', verifyToken, async (req,res) => res.status(201).json(await Cliente.create(req.body)));
app.put('/clientes/:id', verifyToken, verifyAdmin, async (req,res) => res.json(await Cliente.findByIdAndUpdate(req.params.id, req.body, {new:true})));
app.delete('/clientes/:id', verifyToken, verifyAdmin, async (req,res) => res.json(await Cliente.findByIdAndDelete(req.params.id)));

app.listen(process.env.PORT || 3000, () => console.log(`API + Mongo en http://localhost:${process.env.PORT || 3000}`));
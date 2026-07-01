const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(express.json(), cors());

// Conexión
mongoose.connect('mongodb://localhost:27017/express-mongo');

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
// CRUD USUARIOS
app.get('/usuarios', async (req,res) => res.json(await Usuario.find()));
app.get('/usuarios/:id', async (req,res) => {
  const u = await Usuario.findById(req.params.id);
  u ? res.json(u) : res.status(404).json({error: "No existe"});
});
app.post('/usuarios', async (req,res) => res.status(201).json(await Usuario.create(req.body)));
app.put('/usuarios/:id', async (req,res) => {
  const u = await Usuario.findByIdAndUpdate(req.params.id, req.body, {new:true});
  u ? res.json(u) : res.status(404).json({error: "No existe"});
});
app.delete('/usuarios/:id', async (req,res) => {
  const r = await Usuario.findByIdAndDelete(req.params.id);
  r ? res.json({mensaje: "Usuario eliminado"}) : res.status(404).json({error: "No existe"});
});

// CRUD ARTÍCULOS
app.get('/articulos', async (req,res) => res.json(await Articulo.find()));
app.post('/articulos', async (req,res) => res.status(201).json(await Articulo.create(req.body)));
app.put('/articulos/:id', async (req,res) => res.json(await Articulo.findByIdAndUpdate(req.params.id, req.body, {new:true})));
app.delete('/articulos/:id', async (req,res) => res.json(await Articulo.findByIdAndDelete(req.params.id)));

// CRUD CLIENTES
app.get('/clientes', async (req,res) => res.json(await Cliente.find()));
app.post('/clientes', async (req,res) => res.status(201).json(await Cliente.create(req.body)));
app.put('/clientes/:id', async (req,res) => res.json(await Cliente.findByIdAndUpdate(req.params.id, req.body, {new:true})));
app.delete('/clientes/:id', async (req,res) => res.json(await Cliente.findByIdAndDelete(req.params.id)));

app.listen(3000, () => console.log('API + Mongo en http://localhost:3000'));
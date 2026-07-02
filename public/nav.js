document.write(`
  <nav>
    <a href="/login.html">Login</a>
    <a href="/registro.html">Registro</a>
    <a href="/usuarios.html">Usuarios</a>
    <a href="/articulos.html">Artículos</a>
    <a href="/clientes.html">Clientes</a>
    <button onclick="localStorage.removeItem('token'); location.href='/login.html'">Cerrar sesión</button>
  </nav>
`);

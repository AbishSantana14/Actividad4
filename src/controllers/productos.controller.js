const { ProductosRepository } = require('../repositories/productos.repository');

const repo = new ProductosRepository();

async function getAll(req, res) {
  const productos = await repo.getAll();
  
  if (productos.length === 0) {
    return res.status(404).json({ mensaje: 'No hay productos' });
  }
  
  return res.json(productos)
}

async function getAllVisible(req, res) {
  const productos = await repo.getAllActive()
  
  if (productos.length === 0) {
    return res.status(404).json({ mensaje: 'No hay productos activos' });
  }
  
  return res.json(productos)
}

async function getById(req, res) {
  const id = Number(req.params.id)
  const producto = await repo.getById(id)

  if (!producto) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' })
  }

  return res.json(producto)
}

async function create(req, res) {
  const { nombre, precio } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'Nombre inválido' })
  }

  const precioNumber = Number(precio);
  if (precio <= 0) {
    return res.status(400).json({ error: 'Precio inválido' })
  }

  const nuevo = await repo.create(nombre, precioNumber)
  return res.status(201).json({ 
    mensaje: 'Producto creado', 
    producto: nuevo 
  })
}

async function update(req, res) {
  const id = Number(req.params.id);
  const { nombre, precio } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    return res.status(400).json({ error: 'Nombre inválido' })
  }

  const precioNumber = Number(precio);
  if (precio <= 0) {
    return res.status(400).json({ error: 'Precio inválido' })
  }

  const actualizado = await repo.update(id, nombre, precioNumber)

  if (!actualizado) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' })
  }

  return res.json({ 
    mensaje: 'Producto actualizado', 
    producto: actualizado 
  })
}

async function remove(req, res) {
  const id = Number(req.params.id);
  const eliminado = await repo.delete(id)

  if (!eliminado) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' })
  }

  return res.json({ mensaje: 'Producto eliminado' })
}

async function search(req, res) {
  const { 
    nombre, 
    minPrecio, 
    maxPrecio, 
    page = 1, 
    limit = 5 
  } = req.query;

  const pagina = Number(page);
  const limite = Number(limit);

  if (isNaN(pagina) || pagina < 1) {
    return res.status(400).json({ error: 'page y limit debe ser escrito en numero' });
  }

  if (isNaN(limite) || limite < 1) {
    return res.status(400).json({ error: 'limit y page debe ser escrito en numero' });
  }

  const filtros = {
    nombre: nombre,
    minPrecio: minPrecio ? Number(minPrecio) : null,
    maxPrecio: maxPrecio ? Number(maxPrecio) : null,
    pagina: pagina,
    limite: limite
  };

  const resultado = await repo.search(filtros);

  if (resultado.data.length === 0) {
    return res.status(404).json({ 
      mensaje: 'No se encontraron productos',
      page: pagina,
      limit: limite,
      total: 0
    });
  }

  return res.json({
    data: resultado.data,
    page: pagina,
    limit: limite,
    total: resultado.total
  });
}

module.exports = { getAll, getAllVisible, getById, create, update, remove, search };
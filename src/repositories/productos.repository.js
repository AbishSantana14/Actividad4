const { pool } = require('../db');

class ProductosRepository {

  async getAll() {
    const result = await pool.query(
      'select id, nombre, precio from productos order by id asc;'
    );
    return result.rows;
  }

  
  async getAllActive() {
    const result = await pool.query(
      'select id, nombre, precio from productos where activo = true order by id asc;'
    );
    return result.rows;
  }


  async getById(id) {
    const result = await pool.query(
      'select id, nombre, precio from productos where id = $1;', [id]
    );
    return result.rows[0];
  }

  
  async create(nombre, precio) {
    const result = await pool.query(
      'insert into productos (nombre, precio) values ($1,$2) returning id, nombre, precio;',
      [nombre, precio] 
    );
    return result.rows[0];
  }

  
  async update(id, nombre, precio) {
    const result = await pool.query(
      'update productos set nombre = $1, precio = $2 where id = $3 returning id, nombre, precio;',
      [nombre, precio, id]
    );
    return result.rows[0];
  }

  
  async delete(id) {
    const result = await pool.query(
      'delete from productos where id = $1 returning id;',
      [id]
    );
    return result.rows[0];
  }


  async search(filtros) {
    const { nombre, minPrecio, maxPrecio, pagina, limite } = filtros;
    const offset = (pagina - 1) * limite;

    let condiciones = [];
    let valores = [];
    let contador = 1;

    if (nombre) {
      condiciones.push(`nombre ILIKE $${contador}`);
      valores.push(`%${nombre}%`);
      contador++;
    }

    if (minPrecio !== null) {
      condiciones.push(`precio >= $${contador}`);
      valores.push(minPrecio);
      contador++;
    }

    if (maxPrecio !== null) {
      condiciones.push(`precio <= $${contador}`);
      valores.push(maxPrecio);
      contador++;
    }

    let where = '';
    if (condiciones.length > 0) {
      where = 'WHERE ' + condiciones.join(' AND ');
    }

    const queryCount = `SELECT COUNT(*) as total FROM productos ${where}`;
    const resultCount = await pool.query(queryCount, valores);
    const total = parseInt(resultCount.rows[0].total);

    const queryData = `
      SELECT id, nombre, precio 
      FROM productos 
      ${where} 
      ORDER BY id DESC 
      LIMIT $${contador} OFFSET $${contador + 1}
    `;

    valores.push(limite);
    valores.push(offset);

    const resultData = await pool.query(queryData, valores);

    return {
      data: resultData.rows,
      total: total
    };
  }
}

module.exports = { ProductosRepository }
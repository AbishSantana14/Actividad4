const express = require('express')
const { pool } = require('./src/db')
const { router: productosRouter } = require('./src/routes/productos.routes')
const { router: usersRouter } = require('./src/routes/users.routes')
const app = express()
const cors = require('cors');
const { sign, authMiddleware } = require('./src/auth');

const PORT = process.env.PORT || 3000; 

const allowed = [ 
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: function (origin, cb) { 
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) { 
      return cb(null, true);
    } else {
      return cb(new Error('Not allowed by CORS'));
    }
  }
}));


app.use(express.json())


app.get('/', (req, res) => {
  res.send('Servidor Funcionando correctamente');
})

app.use('/productos', productosRouter);
app.use('/users', usersRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'api' })
})

app.get('/health/db', async (req, res) => {
  try {
   
    await pool.query('select 1');
    return res.json({ok:true});
  } catch (err) {
    console.log('DB Error', err.message)
    return res.status(500).json({ ok: false, error: 'DB no disponible' })
  }
})

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (email !== 'admin@test.com' || password !== '1234')
    return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = sign({ email, role: 'admin' });

  return res.json({ token });
});

app.get('/privado', authMiddleware, (req, res) => {
  return res.json({
    ok: true
  })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${PORT}`) 
})
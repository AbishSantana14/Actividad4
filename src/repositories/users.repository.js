const { pool } = require('../db');

class UsersRepository {
    async findByEmail(email) {
        const r = await pool.query(
            'SELECT id, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );
        return r.rows[0] || null;
    }

    async create(email, passwordHash, role = 'user') {
        const r = await pool.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, passwordHash, role]
        );
        return r.rows[0];
    }

    async findById(id) {
        const r = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [id]
        );
        return r.rows[0] || null;
    }
}

module.exports = {UsersRepository} 
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = 3001;

const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL
  )
`);

app.use(cors());
app.use(express.json());

app.get('/tasks', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const status = req.query['filters[status][$eq]'];
  const offset = (page - 1) * pageSize;

  let query = 'SELECT * FROM tasks';
  let countQuery = 'SELECT COUNT(*) as total FROM tasks';
  let params = [];

  if (status) {
    query += ' WHERE status = ?';
    countQuery += ' WHERE status = ?';
    params.push(status);
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(pageSize, offset);

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get(countQuery, status ? [status] : [], (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const tasks = rows.map((row) => ({
        id: row.id,
        attributes: {
          title: row.title,
          description: row.description,
          status: row.status,
        },
      }));

      res.json({
        data: tasks,
        meta: {
          pagination: {
            page,
            pageSize,
            pageCount: Math.ceil(countResult.total / pageSize),
            total: countResult.total,
          },
        },
      });
    });
  });
});

app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body.data;
  const query = 'INSERT INTO tasks (title, description, status) VALUES (?, ?, ?)';
  db.run(query, [title, description, status], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      data: {
        id: this.lastID,
        attributes: { title, description, status },
      },
    });
  });
});

app.put('/tasks/:id', (req, res) => {
  const { title, description, status } = req.body.data;
  const query = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ?';
  db.run(query, [title, description, status, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({
      data: {
        id: parseInt(req.params.id),
        attributes: { title, description, status },
      },
    });
  });
});

app.delete('/tasks/:id', (req, res) => {
  const query = 'DELETE FROM tasks WHERE id = ?';
  db.run(query, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
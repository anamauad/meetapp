import { Router } from 'express';

const routes = new Router();

routes.get('/', (req, res) =>
  res.json({
    msg: 'server up and reloading with EC6, eslint, prettier, routes..',
  })
);

const users = [];

routes.get('/users', (req, res) => {
  res.json({ msg: 'list users: id, name, email', data: users });
});

routes.get('/users/:id', (req, res) => {
  const { id } = req.params;

  res.json({ msg: 'list user: id, name, email', data: users[id] });
});

routes.post('/users', (req, res) => {
  const { name, email, password } = req.body;
  users.push({ name, email, password });

  res.json({
    msg: 'add user: name, email, password (crypto). return id',
    data: users,
  });
});

routes.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  users[id] = users[id] || {};
  if (name) {
    users[id].name = name;
  }
  if (email) {
    users[id].email = email;
  }
  if (password && users[id].password !== password) {
    users[id].password = password;
  }
  res.json({
    msg: 'update user: id, name, email, password, confirm_password',
    data: users[id],
  });
});

routes.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  if (users[id]) {
    users.splice(id, 1);
  }
  res.json({ msg: 'delete user: id', data: users });
});

export default routes;

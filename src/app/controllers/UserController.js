import * as Yup from 'yup';

const users = [];
let count = 0;

class UserController {
  index(req, res) {
    const list = users.map(user => {
      const { id, name, email } = user;
      return { id, name, email };
    });
    return res.json(list);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(401).json({ error: 'Invalid id' });
    }
    const { id } = req.params;
    const user = users.find(u => u.id == id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { name, email } = user;
    return res.json({ id, name, email });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(4),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid input data' });
    }

    const id = count++;
    const { name, email, password } = req.body;
    users.push({ id, name, email, password });

    return res.json({ id, name, email });
  }

  async update(req, res) {
    const schemaId = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schemaId.isValid(req.params))) {
      return res.status(401).json({ error: 'Invalid id' });
    }
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      password: Yup.string().min(4),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
      oldPassword: Yup.string().when('password', (password, field) =>
        password ? field.required() : field
      ),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid input data' });
    }

    const { id } = req.params;
    const user = users.find(u => u.id == id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { name, email, oldPassword, password } = req.body;
    if (password) {
      if (user.password != oldPassword) {
        return res.status(401).json({ error: 'Password does not match' });
      }
      if (oldPassword == password) {
        return res
          .status(401)
          .json({ error: 'New password must be different from actual' });
      }
    }
    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    return res.json({ id, name, email });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(401).json({ error: 'Invalid id' });
    }
    const { id } = req.params;
    const index = users.findIndex(u => u.id == id);
    if (index < 0 || users[index].id != id) {
      return res.status(400).json({ error: 'User not found' });
    }
    users.splice(index, 1);
    return res.json(users);
  }
}
export default new UserController();

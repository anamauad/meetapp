import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async index(req, res) {
    const users = await User.findAll();
    const list = users.map(user => {
      const { id, name, email } = user;
      return { id, name, email };
    });
    if (list.length > 0) {
      return res.json(list);
    }
    return res.json({ msg: 'No users found' });
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(401).json({ error: 'Invalid id' });
    }
    const { id } = req.params;
    const user = await User.findByPk(id);
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

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res
        .status(400)
        .json({ error: 'User with same e-mail already exists' });
    }
    const { id, name, email } = await User.create(req.body);
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

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { email, oldPassword, password } = req.body;
    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Another user has same e-mail address.' });
      }
    }
    if (password) {
      if (!(await user.checkPassword(oldPassword))) {
        return res.status(401).json({ error: 'Password does not match' });
      }
      if (oldPassword == password) {
        return res
          .status(401)
          .json({ error: 'New password must be different from actual' });
      }
    }
    const { name, email: userEmail } = await user.update(req.body);
    return res.json({ id, name, email: userEmail });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.params))) {
      return res.status(401).json({ error: 'Invalid id' });
    }
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    await user.destroy({ where: { id } });
    return res.json({ ok: true });
  }
}
export default new UserController();

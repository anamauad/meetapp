import * as Yup from 'yup';
import { parseISO, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import File from '../models/File';
import Meetup from '../models/Meetup';

class MeetupController {
  async index(req, res) {
    const pageSize = 10;
    const page = req.query.page || 1;
    const where = {};
    if (req.query.date) {
      const parsedDate = parseISO(req.query.date);
      where.date = {
        [Op.gte]: startOfDay(parsedDate),
        [Op.lte]: endOfDay(parsedDate),
      };
    }

    const meetups = await Meetup.findAll({
      where,
      attributes: ['id', 'title', 'date', 'description', 'place'],
      order: ['date'],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    return res.json(meetups);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      place: Yup.string().required(),
      date: Yup.date().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid input data' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { title, date, description, place } = req.body;

    const meetupExists = await Meetup.findOne({ where: { title } });
    if (meetupExists) {
      return res.status(400).json({ error: 'Another meetup has same title.' });
    }

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const { id } = await Meetup.create({
      user_id: req.userId,
      title,
      date,
      description,
      place,
    });
    return res.json({ id, title, date, description, place });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      place: Yup.string(),
      date: Yup.date(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Invalid input data' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    const { title, date } = req.body;

    const meetup = await Meetup.findByPk(req.params.id);
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }
    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the meetup organizer' });
    }

    const meetupExists = await Meetup.findOne({ where: { title } });
    if (meetupExists && meetupExists.id !== meetup.id) {
      return res.status(400).json({
        error: 'Another meetup has same title. Enter a different title.',
      });
    }

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not allowed' });
    }

    const { id, description, place, banner_id } = await meetup.update(req.body);

    return res.json({ id, title, date, description, place, banner_id });
  }

  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'User is not the meetup organizer' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'A meetup in the past cannot be cancelled' });
    }
    await meetup.destroy();

    const { id, title, date, description, place } = meetup;
    return res.json({ id, title, date, description, place });
  }
}
export default new MeetupController();

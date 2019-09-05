import { isBefore, subHours, addHours, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Op } from 'sequelize';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';
import Mail from '../../lib/Mail';

class SubscriptionController {
  async index(req, res) {
    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
        '$session.date$': {
          [Op.gte]: new Date(),
        },
      },
      attributes: [],
      include: [
        {
          model: User,
          as: 'subscriber',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Meetup,
          as: 'session',
          attributes: ['id', 'title', 'date', 'description', 'place'],
        },
      ],
      order: [[{ model: Meetup, as: 'session' }, 'date']],
    });
    return res.json(subscriptions);
  }

  async store(req, res) {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const meetup = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email'],
        },
      ],
    });
    if (!meetup) {
      return res.status(400).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id === req.userId) {
      return res.status(401).json({
        error: 'Meetup cannot accept subscription from the organizer',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'Cannot subscribe to a meetup session in the past' });
    }
    const subscriptionData = {
      user_id: req.userId,
      meetup_id: meetup.id,
    };

    const subscription = await Subscription.findOne({
      where: subscriptionData,
    });
    if (subscription) {
      return res.status(401).json({
        error: 'User has already subscribed to this meetup',
      });
    }

    const subscriptionsAtSameHour = await Subscription.findOne({
      where: {
        user_id: req.userId,
        '$session.date$': {
          [Op.gte]: subHours(meetup.date, 1),
          [Op.lte]: addHours(meetup.date, 1),
        },
      },
      attributes: [],
      include: [
        {
          model: Meetup,
          as: 'session',
          attributes: ['id', 'title', 'date', 'description', 'place'],
        },
      ],
    });
    if (subscriptionsAtSameHour) {
      return res.status(401).json({
        error:
          'User is subscribed to another meetup at the same time interval (2 hours)',
      });
    }

    await Subscription.create(subscriptionData);

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: `Novo inscrito no meetup "${meetup.title}"`,
      template: 'subscription',
      context: {
        organizer: meetup.user.name,
        place: meetup.place,
        title: meetup.title,
        description: meetup.description,
        user: user.name,
        email: user.email,
        date: format(meetup.date, "d 'de' MMM 'de' yyyy 'às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json(subscriptionData);
  }
}
export default new SubscriptionController();

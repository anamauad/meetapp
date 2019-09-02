import { isBefore } from 'date-fns';
import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

class SubscriptionController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const meetup = await Meetup.findByPk(req.params.id);
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
        .json({ error: 'Cannot subscribe to a past meetup session' });
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

    await Subscription.create(subscriptionData);
    return res.json(subscriptionData);
  }
}
export default new SubscriptionController();

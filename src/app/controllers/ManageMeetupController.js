import User from '../models/User';
import Meetup from '../models/Meetup';

class ManageMeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        user_id: req.userId,
      },
      attributes: ['id', 'title', 'date', 'description', 'place'],
      order: ['date'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });
    return res.json(meetups);
  }
}
export default new ManageMeetupController();

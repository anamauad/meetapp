import { Model } from 'sequelize';

class Subscription extends Model {
  static init(sequelize) {
    super.init(null, {
      sequelize,
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'subscriber' });
    this.belongsTo(models.Meetup, { foreignKey: 'meetup_id', as: 'session' });
  }
}

export default Subscription;

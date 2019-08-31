import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        size: Sequelize.INTEGER,
        email: Sequelize.STRING,
        encoding: Sequelize.STRING,
        mimetype: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default File;

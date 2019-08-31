import Sequelize, { Model } from 'sequelize';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );

    this.addHook('beforeSave', user => {
      if (user.password) {
        user.password_hash = user.password
          .split('')
          .reverse()
          .join('');
      }
    });

    return this;
  }

  checkPassword(password) {
    return (
      this.password_hash ==
      password
        .split('')
        .reverse()
        .join('')
    );
  }
}

export default User;

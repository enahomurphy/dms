export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    title: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      primaryKey: true,
      validate: {
        min: {
          args: 3,
          msg: `Role must start be a letter, have no spaces, 
            and be at least 3 characters.`
        },
        max: {
          args: 40,
          msg: `Role must start with a letter, have no spaces, 
            and be at less than 40 characters.`
        },
        is: {
          args: /^[A-Za-z][A-Za-z]+$/i,
          msg: `Role must start with a letter, have no spaces, 
            and be 3 - 40 characters.`
        }
      }
    }
  });
  return Role;
};

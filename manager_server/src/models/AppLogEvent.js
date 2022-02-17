module.exports = (sequelize, DataTypes) => {
    const AppLogEvent = sequelize.define('AppLogEvent', {
        name: DataTypes.STRING,
        data: DataTypes.TEXT
    })
    return AppLogEvent
  }
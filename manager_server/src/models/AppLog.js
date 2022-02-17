module.exports = (sequelize, DataTypes) => {
    const AppLog = sequelize.define('AppLog', {
        uuid : {
            type: DataTypes.STRING,
            unique: true,
        },
        ip: DataTypes.STRING,
        bid: DataTypes.STRING,
        deviceData: DataTypes.TEXT,
    })
    return AppLog
  }
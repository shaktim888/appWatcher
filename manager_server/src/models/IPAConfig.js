module.exports = (sequelize, DataTypes) => {
    const IPAConfig = sequelize.define('IPAConfig', {
        bid : {
            type: DataTypes.STRING,
            unique: true,
        },
    })
    return IPAConfig
}
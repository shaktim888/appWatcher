 module.exports = (sequelize, DataTypes) => {
    const FieldValue = sequelize.define('FieldValue', {
        value : DataTypes.STRING,
    })
    return FieldValue
}
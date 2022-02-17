module.exports = (sequelize, DataTypes) => {
    const FieldType = sequelize.define('FieldType', {
        fieldName : DataTypes.STRING,
        required : DataTypes.BOOLEAN,
        desc : DataTypes.STRING,
        type : DataTypes.ENUM('number', 'string', 'array', "boolean"),
    })
    return FieldType
  }
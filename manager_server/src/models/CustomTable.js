module.exports = (sequelize, DataTypes) => {
    const CustomTable = sequelize.define('CustomTable', {
        tableName : {
            type: DataTypes.STRING,
            unique: true,
        },
    })
    return CustomTable
}
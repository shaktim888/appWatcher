const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const config = require('../config/config')

const db = {}

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
)

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

let arr = fs.readdirSync(__dirname)
  .filter((file)=>
    file !== 'index.js' && file !== ".DS_Store"
  )

arr.forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file))
      db[model.name] = model
})

db.CustomTable.hasMany(db.FieldType, { as : "fields" ,foreignKey: 'table_id'})
db.FieldType.belongsTo(db.CustomTable, { as : "table" ,foreignKey: 'table_id' })

db.CustomTable.hasMany(db.TableRow, { as : "rows" ,foreignKey: 'table_id'})
db.TableRow.belongsTo(db.CustomTable, { as : "table" ,foreignKey: 'table_id' })

db.TableRow.hasMany(db.FieldValue, { as : "values" ,foreignKey: 'row_id'})
db.FieldValue.belongsTo(db.TableRow, { as : "row"  ,foreignKey: 'row_id'})

db.FieldValue.belongsTo(db.FieldType, { as : "type" ,foreignKey: 'type_id' })
db.FieldType.hasMany(db.FieldValue, { as : "values" ,foreignKey: 'type_id' })

db.IPAConfig.belongsTo(db.CustomTable, { as : "table" ,foreignKey: 'table_id' })
db.IPAConfig.belongsTo(db.TableRow, { as : "row" ,foreignKey: 'row_id' })

db.AppLog.hasMany(db.AppLogEvent, {as : "events" ,foreignKey: 'log_id' })

db.sequelize = sequelize
db.Sequelize = Sequelize


module.exports = db
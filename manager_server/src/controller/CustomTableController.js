const {sequelize, Sequelize, CustomTable, TableRow, FieldType, FieldValue} = require('../models')
const interface = {
    async removeRow(id, transaction)
    {
        if(!id) return;
        if(transaction ) {
            let row = await TableRow.findOne({ 
                where : { id : id},
                include : [{
                    model : FieldValue,
                    as : "values",
                }],
                transaction
            })
            if(row) {
                await Promise.all(row.values.map(v => {
                    v.destroy({
                        transaction
                    })
                })).then(()=> {
                    return row.destroy({
                        transaction
                    })
                })
            }
        }
        await sequelize.transaction({}, async (transaction) => {
            await this.removeRow(id, transaction)
        });
        
    },

    async removeType(id, transaction)
    {
        if(!id) return;
        if(transaction) {
            let field = await FieldType.findOne({ 
                where : { id : id},
                include : [{
                    model : FieldValue,
                    as : "values",
                }],
                transaction
            })
            if(field) {
                await Promise.all(field.values.map(v => {
                    v.destroy({
                        transaction
                    })
                })).then(()=> {
                    return field.destroy({
                        transaction
                    })
                })
            }
        } else {
            await sequelize.transaction({}, async (transaction) => {
                await this.removeType(id, transaction)
            })
        }
        
    },

    async removeTable(id, transaction)
    {
        if(transaction) {
            const parent = await CustomTable.findOne({
                where: {
                    id: id
                },
                include: [{ 
                    model : FieldType,
                    as : "fields"
                },{ 
                    model : TableRow,
                    as : "rows", 
                    include : [{
                        model : FieldValue,
                        as : "values",
                    }]
                }],
                transaction
            })
            // 数据保护
            if(parent.rows.length > 0) {
                throw new Error("数据不为空，不能删除")
            }
        
            for (const field of parent.fields) {
                await field.destroy({
                    transaction
                })
            }
            await parent.destroy({
                transaction
            });
        } else {
            await sequelize.transaction({}, async (transaction) => {
                await this.removeTable(id, transaction)
            });
        }
        
    },

    async addTableRow(tableID, row, transaction)  {
        if(transaction) {
            let rowData = {
                table_id : tableID,
            }
            if(row.id) rowData.id = row.id
            if(!rowData.id) {
                rowData = await TableRow.create(rowData, { transaction })
            } else {
                await TableRow.upsert(rowData, { transaction })
            }
            let idMap = {}
            let allValues = row.values.map(v => {
                v.row_id = rowData.id
                v.type_id = v.type.id
                if(v.id) {
                    idMap[v.id] = true
                }
                return v
            })

            let allAddedValue = await FieldValue.findAll({
                where : {
                    row_id : rowData.id
                }
            })
            let deletedList = [];
            for(let item of allAddedValue) {
                if(!idMap[item.id]) {
                    deletedList.push(item.id)
                }
            }
            await FieldValue.destroy({
                where : {
                    id : deletedList
                }
            })
            await FieldValue.bulkCreate(allValues, { updateOnDuplicate:["value", "type_id"], transaction })
            return rowData
        } else {
            return sequelize.transaction({}, async (transaction) => {
                return await this.addTableRow(form, transaction)
            });
        }
    },


    async getTableRowData(query){
        let cond = {}
        if(query.tableName) {
            cond.tableName = query.tableName
        }
        if(query.id) {
            cond.id = query.id
        }
        let data = await CustomTable.findOne({
            where : cond,
            include : [{ 
                model : FieldType,
                as : "fields"
            },{ 
                model : TableRow,
                as : "rows",
                include : [{
                    model : FieldValue,
                    as : "values",
                    include : [{ 
                        model : FieldType,
                        as : "type"
                    }]
                }]
            }]
        });
        return data;
    },
}

const router = {
    async removeCustomTable(req, res) {
        try{
            let query = req.body
            await interface.removeTable(query.id)
            res.send()
        }catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async getTableDetail(req, res) {
        try{
            let query = req.body
            let data = await interface.getTableRowData(query)
            if(data) {
                res.send(data.toJSON())
            } else {
                res.status(400).send({
                    error: "not exist data"
                })
            }
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async updateTableInfo(req,res) {
        try{
            let query = req.body
            await sequelize.transaction({}, async (transaction) => {
                if(query.removeList && query.removeList.length > 0) {
                    for(let rmid of query.removeList) {
                        await removeType(rmid, transaction)
                    }
                }
                await CustomTable.update({tableName: query.tableName}, {where: { id: query.id }, transaction })
                query.fields.forEach(element => {
                    element.table_id = query.id
                });
                await FieldType.bulkCreate(query.fields, { updateOnDuplicate:["fieldName", "required", "type", "desc"], transaction })
                res.send()
            });
            
        }catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async getAllTableNames(req,res) {
        const alltable = await CustomTable.all()
        return res.send(alltable);
    },

    async queryTables(req, res) {
        try{
            var query = req.body
            let cond = {}
            let tableName = query.tableName.trim()
            if(tableName) {
                cond.tableName = tableName
            }
            let offset = (query.pageIndex - 1) * query.pageSize;
            let total = await CustomTable.count();
            let data = await CustomTable.findAndCountAll({
                limit : query.pageSize,
                offset : offset,
                order: [
                    ['createdAt', 'DESC']
                ],
                where : cond,
                include : [{ 
                    model : FieldType,
                    as : "fields"
                }]
            });
            let ret = {
                count : total,
                rows : data.rows.map(item => {
                    return item.toJSON()
                })
            }
            return res.send(ret);  
        }catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async queryTableData(req, res) {
        var query = req.body
        let data = await interface.getTableRowData(query)
        return res.send(data.toJSON());
    },

    async createTable(req,res) {
        var query = req.body
        try{
            const table = await CustomTable.create({
                tableName : query.tableName
            })
            res.send(table.toJSON())
        }catch (err){
            res.status(400).send({
                error:"this table is already in use."
            })
        }
    },

}

module.exports = {
    interface,
    router
}
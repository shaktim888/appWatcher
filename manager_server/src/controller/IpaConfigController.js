const CustomTableController = require('./CustomTableController');
const {IPAConfig, sequelize, TableRow, FieldValue,FieldType} = require('../models')

let interface = {
    async getAllBidList(){
        let all = await IPAConfig.findAll()
        all.map(v => {
            return v.toJSON()
        })
        return all
    },

    async createIPAConfig(form) {
        return await sequelize.transaction({}, async (transaction) => {
            let tableData = {
                bid : form.bid
            }
            if(form.id) tableData.id = form.id
            tableData.table_id = form.table_id
            let rowData = await CustomTableController.interface.addTableRow(form.table_id, form.row, transaction)
            tableData.row_id = rowData.id
            await IPAConfig.upsert(tableData, { transaction })
        })
    },

    async queryIPAConfig(query) {
        let cond = {}
        let bid = query.bid.trim()
        if(bid) {
            cond.bid = bid
        }
        let offset = (query.pageIndex - 1) * query.pageSize;
        let total = await IPAConfig.count();
        let data = await IPAConfig.findAndCountAll({
            limit : query.pageSize,
            offset : offset,
            order: [
                ['createdAt', 'DESC']
            ],
            where : cond,
            include : [{ 
                model : TableRow,
                as : "row",
                include : {
                    model : FieldValue,
                    as : "values",
                    include : {
                        model : FieldType,
                        as : "type"
                    }
                }
            }]
        });
        let ret = {
            count : total,
            rows : data.rows.map(item => {
                return item.toJSON()
            })
        }
        return ret;  
    },

    async removeIpaConfig(id, transaction) {
        if(transaction) {
            const parent = await IPAConfig.findOne({
                where: {
                    id: id
                },
                include: [{ 
                    model : TableRow,
                    as : "row",
                    include : { 
                        model : FieldValue,
                        as : "values"
                    }
                }],
                transaction
            })
            if(parent.row) {
                for (const value of parent.row.values) {
                    await value.destroy({
                        transaction
                    })
                }
                await parent.row.destroy({
                    transaction
                });
            }
            
            await parent.destroy({
                transaction
            });
        } else {
            return sequelize.transaction({}, async (transaction) => {
                return await this.removeIpaConfig(id, transaction)
            });
        }
    },

    async getConfig(bid) {
        const data = await IPAConfig.findOne({
            where: {
                bid: bid
            },
            include: [{ 
                model : TableRow,
                as : "row",
                include : { 
                    model : FieldValue,
                    as : "values",
                    include : {
                        model : FieldType,
                        as : "type"
                    }
                }
            }]
        })
        let ret = ""
        if(data && data.row) {
            for(let value of data.row.values) {
                ret = ret || {}
                if(value.type.type == "number") {
                    ret[value.type.fieldName] = Number(value.value)
                } else if(value.type.type == "string") {
                    ret[value.type.fieldName] = value.value
                } else if(value.type.type == "boolean") {
                    ret[value.type.fieldName] = !!JSON.parse(value.value)
                } else {
                    ret[value.type.fieldName] = JSON.parse(value.value)
                }
            }
        }
        return ret;
    }
}

let router = {
    async getAllBidList(req, res) {
        try{
            let dat = await interface.getAllBidList()
            res.send(dat);
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async createOneIPAConfig(req, res) {
        try{
            let query = req.body
            await interface.createIPAConfig(query)
            res.send()
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async queryIPAConfig(req, res) {
        try{
            let query = req.body
            let data = await interface.queryIPAConfig(query)
            res.send(data)
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },

    async removeIPAConfig(req, res) {
        try {
            let query = req.body
            await interface.removeIpaConfig(query.id)
            res.send()
        } catch(err) {
            res.status(400).send({
                error: err.message
            })
        }
    },

    async getConfig(req, res) {
        try {
            let query = req.query
            let data = await interface.getConfig(query.bid)
            res.send(data)
        } catch(err) {
            res.status(400).send({
                error: ""
            })
        }
    }
}

module.exports = {
    interface,
    router
}
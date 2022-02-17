const {AppLog, AppLogEvent, sequelize, Sequelize} = require('../models')
const fs = require("fs")
const path = require("path")
const ByteArray = require("../tools/ByteArray")

var mXorKey = [0];

function initXor() {
    if (mXorKey[0] != 0)
        return;
    mXorKey = fs.readFileSync(path.resolve(__dirname, "../config/decode.key"));
}
  
function decodeChunk(arr)
{
    var len = arr.length
    var dataString = ""
    var mod = len % mXorKey.length;
    for( let i = 0 ; i < len; i++) {
        arr[i] = arr[i] ^ (mXorKey[mod])
        dataString += String.fromCharCode(arr[i])
    }
    return dataString
}
initXor();

module.exports = {
    parser(req,res,next) {
        let arr = new ByteArray();
        req.on('data',(data)=>{
            arr.push(data);
        })
        req.on('end',()=>{
            try{
                req.chunk = JSON.parse(decodeChunk(arr.readBytes(arr.length)))
            }catch(err){
                console.log(err)
            }
            next()
        })
    },

    async upload(req, res) {
        try{
            var data = req.chunk
            if(data) {
                sequelize.transaction({}, async (transaction) => {
                    let fd = await AppLog.findOne({
                        where : {
                            uuid : data.uuid
                        },
                        transaction
                    })
                    if(!fd) {
                        fd = await AppLog.create({
                            "uuid" : data.uuid,
                            "ip" : req.ip,
                            "bid" : data.bid,
                            "deviceData" : JSON.stringify(data.d),
                        })
                    }
                    let addEvents = [];
                    // 批量上传的事件
                    if(data.data && data.data._arr_) {
                        for(let e of data.data._arr_) {
                            let d = {}
                            if(e._e_) {
                                d.name = e._e_
                                delete e._e_
                            }
                            if(e._t_) {
                                d.createdAt = new Date(e._t_ * 1000)
                                delete e._t_
                            }
                            d.data = JSON.stringify(e)
                            d.log_id = fd.id
                            addEvents.push(d)
                        }
                    } else {
                        addEvents.push({
                            name : data.event,
                            data : JSON.stringify(data.data),
                            log_id : fd.id
                        })
                    }
                    await AppLogEvent.bulkCreate(addEvents, { updateOnDuplicate:["name", "data"], transaction })
                    res.send();
                });
            }
        } catch (err){
            res.status(400).send({
                error:""
            })
        }
    },

    async getAppList(req, res) {
        let list = await AppLog.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('bid')), 'bid']]
        });
        list = list.map(item => {
            return item.toJSON()
        })
        return res.send(list);
    },

    async search(req, res) {
        try{
            let {bid, starttime, endtime, pageSize, pageIndex} = req.body;
            let cond = {}
            bid = bid.trim()
            let uuid;
            if(bid) {
                cond.bid = bid
            }
            if(starttime || endtime) {
                cond.createdAt = {}
                if(starttime) cond.createdAt.$gt = new Date(starttime)
                if(endtime) cond.createdAt.$lt = new Date(endtime)
            }
            let offset = (pageIndex - 1) * pageSize;
            let data = await AppLog.findAndCountAll({
                limit : pageSize,
                offset : offset,
                order: [
                    ['createdAt', 'DESC']
                ],
                where : cond
            });
            let ret = {
                count : data.count,
                rows : data.rows.map(item => {
                    return item.toJSON()
                })
            }
            return res.send(ret);
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },
    
    async getEvents(req, res) {
        try{
            let query = req.body
            let ret = await AppLogEvent.findAll({
                where : {
                    log_id : query.id
                },
                order: [
                    ['createdAt', 'DESC']
                ],
            })
            if(ret) {
                ret.map(v => {
                    return v.toJSON()
                })
            }
            return res.send(ret);
        } catch (err){
            res.status(400).send({
                error: err.message
            })
        }
    },
}
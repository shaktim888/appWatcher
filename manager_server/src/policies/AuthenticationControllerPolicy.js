const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const {User} = require('../models')
module.exports = {
    register(req, res, next){
        const schema = {
            email:Joi.string().alphanum(),
            password:Joi.string().regex(
                new RegExp('^[a-zA-Z0-9]{6,32}$')
            ),
        }
        const {error, value} = Joi.validate(req.body, schema)
        if(error){
            switch(error.details[0].type){
                case 'string.email':
                    res.status(400).send({
                        error : 'you have to provide a validate email address'
                    })
                    break
                case 'string.regex.base':
                    res.status(400).send({
                        error: `you have to provide a validate password:
                        
                        1. upper case 2. lower case 3.numerics 4. 8-32 in length`
                    })
                    break
                default:
                    res.status(400).send({
                        error: 'invalidated registration information'
                    })
            }
        }else{
            next();
        }
    },

    async verifytoken(req, res, next)
    {
        try{
            let auth_token = req.headers.authorization
            if (!auth_token) {
                auth_token = req.cookies.token
            }
            var vret = jwt.verify(auth_token, config.authentication.jwtSecret)
            if( vret.exp * 1000 <= Date.now()) {
                res.end('Access token has expired', 401)
            }
            const user = await User.findOne({
                where: {
                    email: vret.email
                }
            })
            if(!user) {
                res.end('not exist user', 401)
            }
            next()
        } catch (e) {
            // 登录失败 重新登录
            return res.status(401).json({
                msg: 'not exist login token'
            })
        }
   },

}
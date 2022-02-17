module.exports = {
    port : 10010,
    db : {
        database : "hyserver",
        user : "root",
        password : "password",
        options : {
            host: "localhost",
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 30000
            }
        }
    },
    authentication : {
        jwtSecret : "hypassword"
    }
}
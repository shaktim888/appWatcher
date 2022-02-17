const AuthenticationController = require('../src/controller/AuthenticationController') 
const AuthenticationControllerPolicy = require('./policies/AuthenticationControllerPolicy')
const SongsController = require('../src/controller/SongsController')
const MarkdownController = require('../src/controller/MarkdownController')
const AppWatchController = require('../src/controller/AppWatchController')
const CustomTableController = require('./controller/CustomTableController')
const IpaConfigController = require('./controller/IpaConfigController')


module.exports = (app) => {

    // -------------------用户模块----------------------
    app.post('/user/register',
    AuthenticationControllerPolicy.register,
    AuthenticationController.register)

    app.post('/user/login',
    AuthenticationController.login)

    // -------------------应用日志监控-------------------
    app.get('/applog/getAppList',
    AuthenticationControllerPolicy.verifytoken,
    AppWatchController.getAppList)

    app.post('/applog/queryAppLogs',
    AuthenticationControllerPolicy.verifytoken,
    AppWatchController.search)

    app.post('/applog/getAppLogEvents',
    AuthenticationControllerPolicy.verifytoken,
    AppWatchController.getEvents)

    // -------------------表结构管理-----------------------
    app.get('/table/getTableNames',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.getAllTableNames)

    app.post('/table/queryTables',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.queryTables)

    app.post('/table/updateTableInfo',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.updateTableInfo)
    
    app.post('/table/createCustomTable',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.createTable)
    
    app.post('/table/removeCustomTable',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.removeCustomTable)

    app.post('/table/getTableDetail',
    AuthenticationControllerPolicy.verifytoken,
    CustomTableController.router.getTableDetail)

    // -------------------SDK远程配置管理-------------------

    app.get('/sdk/getSdkBidList',
    AuthenticationControllerPolicy.verifytoken,
    IpaConfigController.router.getAllBidList)
    
    app.post('/sdk/createOrUpdateData',
    AuthenticationControllerPolicy.verifytoken,
    IpaConfigController.router.createOneIPAConfig)
       
    app.post('/sdk/queryIPAConfig',
    AuthenticationControllerPolicy.verifytoken,
    IpaConfigController.router.queryIPAConfig)
    
    app.post('/sdk/removeConfig',
    AuthenticationControllerPolicy.verifytoken,
    IpaConfigController.router.removeIPAConfig)
    
    app.get('/getConfig',
    IpaConfigController.router.getConfig)


    // app.get('/markdown',
    // MarkdownController.index)
    
    // app.post('/markdown',
    // MarkdownController.post)

    // app.get('/markdown/:markdownId',
    // MarkdownController.show)


    // -------------------接收苹果端数据-------------------
    app.post('/receive', AppWatchController.parser,
    AppWatchController.upload)
} 
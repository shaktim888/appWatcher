import request from '../utils/request';
// -------------------用户模块----------------------
export const USER = {
    login(query) {
        return request.post("user/login", query)
    },
    register(query) {
        return request.post("user/register", query)
    }
}

// -------------------应用日志监控-------------------
export const APPLOG = {
    queryAppLogs(query) {
        return request.post("applog/queryAppLogs", query);
    },
    getBidList(query) {
        return request.get("applog/getAppList")
    },
    getEvents(query) {
        return request.post("applog/getAppLogEvents", query);
    }
}

// -------------------表结构管理-----------------------
export const TABLES = {
    getTableNameList() {
        return request.get("table/getTableNames")
    },
    createTable(form) {
        return request.post("table/createCustomTable", form)
    },
    queryTables(form) {
        return request.post("table/queryTables", form)
    },
    updateTableInfo(form) {
        return request.post("table/updateTableInfo", form)
    },
    removeTable(form) {
        return request.post("table/removeCustomTable", form)
    },
    getTableDetail(form) {
        return request.post("table/getTableDetail", form)
    },
}

// -------------------SDK管理-----------------------
export const SDK_CONFIG = {
    getbidList() {
        return request.get("sdk/getSdkBidList")
    },
    createCfg(form) {
        return request.post("sdk/createOrUpdateData", form)
    },
    queryIPAConfig(form) {
        return request.post("sdk/queryIPAConfig", form)
    },
    removeIPAConfig(form) {
        return request.post("sdk/removeConfig", form)
    },
    
}
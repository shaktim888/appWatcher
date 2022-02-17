<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 基础表格
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-date-picker
                    class="mr10"
                    v-model="query.starttime"
                    type="date"
                    placeholder="起始日期">
                </el-date-picker>
                <el-date-picker
                    class="mr10"
                    v-model="query.endtime"
                    type="date"
                    placeholder="结束日期">
                </el-date-picker>
                <el-autocomplete class="inline-input handle-input mr10" v-model="query.bid" :fetch-suggestions="querySearch" placeholder="输入bundleID" @select="handleSelect"></el-autocomplete>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                v-loading="loading"
                class="table"
                ref="multipleTable"
                stripe
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column prop="uuid" label="访问标识" align="center" width="180"></el-table-column>
                <el-table-column prop="ip"  label="访问的ip" align="center" width="180"></el-table-column>
                <el-table-column prop="bid" label="bundleID" align="center" width="180"></el-table-column>
                <el-table-column label="设备信息" align="center">
                    <template slot-scope="scope">
                         <el-table
                            border
                            :data="parseTable(scope.row.deviceData)"
                            class="innerTable"
                            max-height="200"
                            :show-header="false"
                            header-cell-class-name="table-header"
                        >
                        <el-table-column prop="key" label="字段名" align="center"></el-table-column>
                        <el-table-column label="值" align="center">
                            <template slot-scope="scope">
                                <p v-if="scope.row.key=='lt'">{{ scope.row.value * 1000 | formatDate }}</p>
                                <p v-else>{{scope.row.value}}</p>
                            </template>
                        </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column label="时间" align="center" width="100">
                    <template slot-scope="scope">
                        <p>{{ scope.row.createdAt | formatDate }}</p>
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center"  width="100">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-s-unfold"
                            @click="handleOpenDetail(scope.$index, scope.row)"
                        >查看信息</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>

            <!-- 新建表弹出框 -->
            <el-dialog v-dialogDrag title="查看事件" :visible.sync="dialogVisible" width="80%">
                <el-switch
                v-model="isLandscape"
                active-text="横屏"
                inactive-text="竖屏">
                </el-switch>
                <el-container v-loading="dialogLoading" style="height: 500px; margin-top:20px">
                    <div class="handle-box">
                        <el-button type="primary" icon="el-icon-search" @click="queryEventList">刷新</el-button>
                    </div>
                    <el-aside width="300px">
                        <el-steps direction="vertical" space="60px">
                            <el-step :status="getStepStatus(item)" v-for="(item, index) in allEvents" :key="index" :title="item.name" :description="item.createdAt | formatDate" @click.native="clickedOneItem(item)"></el-step>
                        </el-steps>
                    </el-aside>
                    <el-main>
                        <el-form label-position="left" label-width="80px" v-if="mainInfo.name">
                            <el-form-item label="事件名">
                                <p>{{ mainInfo.name }}</p>
                            </el-form-item>
                            <el-form-item label="时间">
                                <p>{{ mainInfo.createdAt | formatDate }}</p>
                            </el-form-item>
                            <el-form-item label="点击位置" v-if="checkisinput(mainInfo)">
                                <phone-canvas :landscape="isLandscape" :mobileWidth="mobileWidth" :mobileHeight="mobileHeight" :pos="JSON.parse(mainInfo.data).pos" ></phone-canvas>
                            </el-form-item>
                            <el-form-item label="数据">
                                    <json-viewer v-if="mainInfo.data"
                                    :value="JSON.parse(mainInfo.data)"
                                    :expand-depth=5
                                    sort></json-viewer>
                                    <p v-else>无数据</p>
                            </el-form-item>

                        </el-form>
                        <el-alert v-else
                            title="点击左侧可以显示详细信息"
                            type="error"
                            :closable="false">
                        </el-alert>
                    </el-main>
                </el-container>
                <el-alert
                    title="点击左侧可以显示详细信息"
                    type="success"
                    :closable="false">
                </el-alert>
                
            </el-dialog>
            
        </div>
    </div>
</template>

<script>
import { APPLOG } from '../../api/index';
import phoneCanvas from "../common/phoneCanvas";

export default {
    name: 'LogManager',
    data() {
        let data = {
            mobileWidth :0,
            mobileHeight : 0,
            isLandscape : true,
            mainInfo : {},
            currentID : 0,
            allEvents : [],
            dialogLoading : false,
            dialogVisible : false,
            bidList : [],
            query: {
                bid: '',
                starttime: "",
                endtime : "",
                pageIndex: 1,
                pageSize: 5
            },

            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            loading : false
        };


        return data;
    },
    components: {
        phoneCanvas
    },
    created() {
        this.getData();
    },
    methods: {
        checkisinput(info){
            if(this.mobileWidth <= 0 || this.mobileHeight <= 0) return false;
            if(info.name == "input" || info.name == "click") {
                return true
            }
            return false
        },
        getStepStatus(item) {
            return (item.id == this.mainInfo.id) ? "finish" : "process"
        },
        parseTable(data) {
            data = JSON.parse(data)
            let ret = [];
            let sortArr = {
                // 总是放最后就好
                w : 100,
                h : 101,

                idfa : 1,
                tz : 2,
                lt : 3,
                lang : 4,
                net : 5,
                device : 6,
                phone : 7,
                version : 8,
            }
            for(let key in data) {
                ret.push({ key : key, value : data[key]})
            }
            let d = 99
            ret.sort((a, b) => {
                return (sortArr[a.key] || d) - (sortArr[b.key] || d)
            })
            return ret
        },
        handleSelect(item) {
            this.query.bid = item.bid
        },
        createFilter(queryString) {
            return (item) => {
                return (item.bid.toLowerCase().indexOf(queryString.toLowerCase()) >= 0);
            };
        },
        querySearch(queryString, cb) {
            if(this.bidList.length == 0) {
                APPLOG.getBidList().then((list) => {
                    for(let v of list) {
                        if(v.bid) {
                            this.bidList.push({
                                value : v.bid,
                                bid : v.bid
                            })
                        }
                    }
                    var allItems = this.bidList;
                    var results = queryString ? allItems.filter(this.createFilter(queryString)) : allItems;
                    // 调用 callback 返回建议列表的数据
                    cb(results);
                })
            } else {
                var allItems = this.bidList;
                var results = queryString ? allItems.filter(this.createFilter(queryString)) : allItems;
                // 调用 callback 返回建议列表的数据
                cb(results);
            }
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            this.loading = true
            APPLOG.queryAppLogs(this.query).then(res => {
                this.loading = false
                this.tableData = res.rows;
                this.pageTotal = res.count || 50;
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        clickedOneItem(item) {
            this.mainInfo = item
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        queryEventList(){
            this.dialogLoading = true
            APPLOG.getEvents({ id : this.currentID }).then(ret => {
                this.dialogLoading = false
                this.allEvents = ret;
            }).catch(()=>{
                this.dialogLoading = false
            })
        },
        // 编辑操作
        handleOpenDetail(index, row) {
            this.currentID = row.id
            this.dialogVisible = true
            this.mainInfo = {}
            let deviceData = JSON.parse(row.deviceData)
            this.mobileWidth = deviceData.w || 0
            this.mobileHeight = deviceData.h || 0
            this.isLandscape = this.mobileWidth > this.mobileHeight
            this.queryEventList()
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
    margin-right: 20px;
    display: block;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>

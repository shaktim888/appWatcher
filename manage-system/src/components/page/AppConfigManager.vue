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
                <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addNewTable">新建远程配置</el-button>
                <el-autocomplete class="inline-input handle-input mr10" v-model="query.bid" :fetch-suggestions="querySearch" placeholder="输入BundleID" @select="handleSelect"></el-autocomplete>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column prop="bid" label="bundleID"></el-table-column>
                <el-table-column label="数据信息">
                    <template slot-scope="scope">
                        <el-table
                            border
                            :data="scope.row.row.values"
                            class="innerTable"
                            :show-header="false"
                            max-height="300"
                            header-cell-class-name="table-header"
                        >
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <span>{{ props.row.type.desc }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="字段名" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.type.fieldName }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="type" label="类型" align="center">
                            <template slot-scope="scope">
                                <span>{{ scope.row.type.type }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="value" label="值" align="center">
                        </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
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
        </div>

        <!-- 新建表弹出框 -->
        <el-dialog v-dialogDrag title="SDK配置" :visible.sync="editVisible" fullscreen>
            <el-form :model="editForm" label-width="100px">
                <el-form-item label="BundleID" required>
                    <el-input class="inline-input handle-input" v-model="editForm.bid"></el-input>
                </el-form-item>

                <el-form-item label="表结构" required>
                    <el-select v-model="editForm.table_id" filterable placeholder="请选择表结构" @change="onSelectTableChanged"  class="mr10" >
                        <el-option
                        v-for="item in tableList"
                        :key="item.tableName"
                        :label="item.tableName"
                        :value="item.id">
                        </el-option>
                    </el-select>
                    <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addNewField">添加字段</el-button>
                </el-form-item>
            </el-form>
            <el-table
                v-loading="editLoading"
                :data="editForm.row.values"
                border
                class="table"
                header-cell-class-name="table-header"
            >

            <el-table-column type="expand">
                <template slot-scope="props">
                    <span>{{ props.row.type.desc }}</span>
                </template>
            </el-table-column>
            <el-table-column label="字段名" align="center">
                <template slot-scope="scope">
                    <p>{{ scope.row.type.fieldName }}</p>
                </template>
            </el-table-column>
            <el-table-column label="类型" align="center">
                <template slot-scope="scope">
                    <p>{{ scope.row.type.type }}</p>
                </template>
            </el-table-column>
            <el-table-column label="值" align="center">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.value" placeholder="请输入内容"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="!scope.row.type.required"
                            type="text"
                            icon="el-icon-delete"
                            class="red"
                            @click="handleDeleteValue(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">应 用</el-button>
            </span>

            <el-dialog
                width="80%"
                title="选择字段"
                :visible.sync="selectFieldVisible"
                append-to-body>

                <el-table
                    v-loading="editLoading"
                    :data="filterUnusedField()"
                    border
                    class="table"
                    max-height="500px"
                    header-cell-class-name="table-header"
                >
                <el-table-column prop="fieldName" label="字段名" align="center"></el-table-column>
                <el-table-column prop="type" label="类型" align="center"></el-table-column>
                <el-table-column prop="desc" label="描述" align="center"></el-table-column>
                <el-table-column label="选择" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button
                            type="text"
                            icon="el-icon-plus"
                            @click="handleAddField(scope.$index, scope.row)"
                        >选择</el-button>
                    </template>
                </el-table-column>
                </el-table>
            </el-dialog>
        </el-dialog>
    </div>
</template>

<script>

import { SDK_CONFIG, TABLES } from '../../api/index';
export default {
    name: 'SDKManager',
    data() {
        return {
            tableList : [],
            queryList : [],
            editLoading : false,
            selectFieldVisible : false,
            query: {
                bid: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            multipleFieldSelection : [],
            delList: [],
            editVisible: false,
            pageTotal: 0,
            allFields : [],
            editForm: {
                bid : "",
                row : {
                    values : []
                },
                table_id : "",
            },
            idx: -1,
            id: -1
        };
    },
    created() {
        this.getData();
        this.getAllTableNames();
    },
    methods: {
        onSelectTableChanged(val) {
            this.searchFields().then(() => {
                this.editForm.row.values.splice(0);
                for(let field of this.allFields) {
                    if(field.required) {
                        this.editForm.row.values.push({
                            type : field,
                            value : ""
                        })
                    }
                }
            })
        },
        searchFields() {
            this.allFields = []
            this.editLoading = true
            return TABLES.getTableDetail({
                id : this.editForm.table_id
            }).then(ret => {
                this.editLoading = false
                this.allFields = ret.fields
            })
        },

        getAllTableNames() {
            TABLES.getTableNameList().then(ret => {
                this.tableList = ret
            })
        },
        
        handleSelect(item) {
            this.query.tableName = item.tableName
        },
        createFilter(queryString) {
            return (item) => {
                return (item.tableName.toLowerCase().indexOf(queryString.toLowerCase()) >= 0);
            };
        },
        querySearch(queryString, cb) {
            SDK_CONFIG.getbidList().then((list) => {
                this.queryList.splice(0);
                for(let v of list) {
                    this.queryList.push({
                        value : v.bid,
                        bid : v.bid
                    })
                }
                var allItems = this.queryList;
                var results = queryString ? allItems.filter(this.createFilter(queryString)) : allItems;
                // 调用 callback 返回建议列表的数据
                cb(results);
            })
        },
        handleDeleteValue(index, value) {
            this.editForm.row.values.splice(index, 1);
        },
        filterUnusedField() {
            return this.allFields.filter( item => {
                for(let v of this.editForm.row.values) {
                    if(v.type.id == item.id) {
                        return false;
                    }
                }
                return true;
            })
        },

        handleAddField(index, data) {
            this.editForm.row.values.push({
                type : data,
                value : ""
            })
        },

        addNewTable() {
            this.editVisible = true
            this.editForm = {
                bid : "",
                row : {
                    values : []
                },
                table_id : "",
            }
        },

        // 获取 easy-mock 的模拟数据
        getData() {
            SDK_CONFIG.queryIPAConfig(this.query).then(res => {
                this.tableData = res.rows;
                this.pageTotal = res.count || 50;
            });
        },
        handleSelectionFieldChange(val) {
            this.multipleFieldSelection = val;
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
                SDK_CONFIG.removeIPAConfig({ id : row.id }).then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                }).catch((e) => {
                    this.$message.error(e || "删除失败");
                })
            })
            .catch(() => {});
        },
        addNewField()
        {
            if(this.allFields.length > 0) {
                this.selectFieldVisible = true
            }
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
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
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index
            let form = JSON.parse(JSON.stringify(row))
            console.log(form)
            this.editForm = form
            this.searchFields()
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.$confirm('确定要应用修改吗？', '提示', {
                type: 'warning'
            }).then(()=>{
                this.editVisible = false;
                var org = this.tableData[this.idx];
                let form = JSON.parse(JSON.stringify(this.editForm));
                let fullloading = this.$loading({fullscreen: true})
                SDK_CONFIG.createCfg({
                    id : form.id,
                    bid : form.bid,
                    row : form.row,
                    table_id : form.table_id
                }).then(()=>{
                    fullloading.close()
                    this.$message.success(`修改成功`);
                    this.getData();
                }).catch((e) => {
                    fullloading.close()
                    this.$message.error(e || "修改失败");
                })
            }).catch(()=>{
                
            })
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
.innerTable {
    width : 100%;
    margin: 0 0 0 0;
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

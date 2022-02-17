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
                <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addNewTable">新建表结构</el-button>
                <el-autocomplete class="inline-input handle-input mr10" v-model="query.tableName" :fetch-suggestions="querySearch" placeholder="输入表名" @select="handleSelect"></el-autocomplete>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column prop="tableName" label="表名"></el-table-column>
                <el-table-column label="数据列信息">
                    <template slot-scope="scope">
                        <el-table
                            border
                            :data="scope.row.fields"
                            class="innerTable"
                            :show-header="false"
                            max-height="300"
                            header-cell-class-name="table-header"
                        >
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <span>{{ props.row.desc }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="fieldName" label="字段名" align="center"></el-table-column>
                        <el-table-column prop="type" label="类型" align="center"></el-table-column>
                        <el-table-column label="是否必填" align="center">
                            <template slot-scope="scope">
                                 <el-checkbox v-if="scope.row.required" v-model="scope.row.required" disabled>必填</el-checkbox>
                            </template>
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
        <el-dialog v-dialogDrag title="新建表结构" :visible.sync="createVisible" width="30%">
            <el-form :model="createForm" label-width="70px">
                <el-form-item label="表名">
                    <el-input v-model="createForm.tableName"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createVisible = false">取 消</el-button>
                <el-button type="primary" @click="confirmAddTable">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑弹出框 -->
        <el-dialog fullscreen title="编辑表结构" :visible.sync="editVisible" :close-on-click-modal="false">
            <div class="handle-box">
                <el-button type="primary" icon="el-icon-plus" class="mr10" @click="addNewField">添加字段</el-button>
                <el-input v-model="editForm.tableName" placeholder="输入表名" class="inline-input handle-input mr10"></el-input>
            </div>
            <el-table
                border
                :data="editForm.fields"
                class="innerTable"
                height="400"
                header-cell-class-name="table-header"
            >
            <el-table-column label="字段名" align="center">
                <template slot-scope="scope">
                <el-input v-model="scope.row.fieldName" placeholder="请输入内容"></el-input>
                </template>
            </el-table-column>
            <el-table-column prop="type" label="类型" align="center">
                <template slot-scope="scope">
                    <el-select v-model="scope.row.type" placeholder="请选择">
                        <el-option
                        v-for="item in options"
                        :key="item"
                        :label="item"
                        :value="item">
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column label="是否界面显示" align="center">
                <template slot-scope="scope">
                <el-checkbox v-model="scope.row.required">是否必填</el-checkbox>
                </template>
            </el-table-column>
            <el-table-column label="描述" align="center">
                <template slot-scope="scope">
                <el-input v-model="scope.row.desc" placeholder="请输入描述"></el-input>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center">
                <template slot-scope="scope">
                    <el-button
                        type="text"
                        icon="el-icon-delete"
                        class="red"
                        @click="handleDeleteField(scope.$index, scope.row)"
                    >删除</el-button>
                </template>
            </el-table-column>
            </el-table>
            
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">应 用</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { TABLES } from '../../api/index';
export default {
    name: 'TableManager',
    data() {
        return {
            options :["string", "boolean", "number", "array"],
            queryList : [],
            query: {
                tableName: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            multipleFieldSelection : [],
            delList: [],
            createVisible : false,
            editVisible: false,
            pageTotal: 0,
            editForm: {},
            createForm : {
                tableName : ""
            },
            idx: -1,
            id: -1
        };
    },
    created() {
        this.getData();
    },
    methods: {
        handleSelect(item) {
            this.query.tableName = item.tableName
        },
        createFilter(queryString) {
            return (item) => {
                console.log(item.tableName.toLowerCase())
                return (item.tableName.toLowerCase().indexOf(queryString.toLowerCase()) >= 0);
            };
        },
        querySearch(queryString, cb) {
            TABLES.getTableNameList().then((list) => {
                this.queryList.splice(0);
                for(let v of list) {
                    this.queryList.push({
                        value : v.tableName,
                        tableName : v.tableName
                    })
                }
                var allItems = this.queryList;
                var results = queryString ? allItems.filter(this.createFilter(queryString)) : allItems;
                // 调用 callback 返回建议列表的数据
                cb(results);
            })
        },

        addNewTable() {
            this.createVisible = true
        },
        confirmAddTable() {
            let fullloading = this.$loading({fullscreen: true})
            TABLES.createTable(this.createForm).then(ret => {
                fullloading.close()
                this.$message.success('创建成功');
                this.createVisible = false
                this.getData();
            }).catch(e => {
                this.$message.error(e || "创建失败");
                fullloading.close()
            }) 
        },

        // 获取 easy-mock 的模拟数据
        getData() {
            TABLES.queryTables(this.query).then(res => {
                console.log(res)
                this.tableData = res.rows;
                this.pageTotal = res.count || 50;
            });
        },
        handleSelectionFieldChange(val) {
            console.log(val)
            this.multipleFieldSelection = val;
        },
        handleDeleteField(index, data) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            }).then(()=>{
                this.editForm.fields.splice(index, 1);
            }).catch(()=>{

            })
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
                TABLES.removeTable({ id : row.id }).then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                }).catch((e) => {
                    this.$message.error(e || "删除失败");
                    console.log(e)
                })
            })
            .catch(() => {});
        },
        addNewField()
        {
            this.editForm.fields.push({
                type : "string",
                required : false,
                fieldName : "newField",
                desc : ""
            })
        },
        // 多选操作
        handleSelectionChange(val) {
            console.log(val)
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
            this.idx = index;
            this.editForm = JSON.parse(JSON.stringify(row));
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
                let removeList = []
                for(let item of org.fields) {
                    var foundit = false;
                    for(let eitr of this.editForm.fields) {
                        if(item.id == eitr.id) {
                            foundit = true;
                            break;
                        }
                    }
                    if(!foundit) {
                        removeList.push(item.id)
                    }
                }
                form.removeList = removeList

                TABLES.updateTableInfo(form).then(()=>{
                    this.$set(this.tableData, this.idx, this.editForm);
                    this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                }).catch((e) => {
                    this.$message.error(e || "注册失败");
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

<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i>用户信息</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!-- <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button> -->
                <el-input v-model="select_word" placeholder="登录账号" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
                <el-button type="primary" icon="add" class="handle-del mr10" @click="handleAdd">新增</el-button>
            </div>
            <el-table :data="tableData" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                 <el-table-column prop="id" label="编号" sortable width="150">
                 </el-table-column>
                <el-table-column prop="loginName" label="登录账号" sortable width="150">
                </el-table-column>
                <el-table-column prop="loginPwd" label="登录密码" sortable width="150">
                 </el-table-column>
                <el-table-column prop="isActive" label="是否有效" width="120">
                </el-table-column>
                <el-table-column prop="createTime" label="注册时间" sortable >
                </el-table-column>
                <el-table-column prop="updateTime" label="修改时间" sortable >
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                    @current-change="handleCurrentChange"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="totalCount">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="50px">
                <el-form-item label="账号">
                    <el-input v-model="form.loginName"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.loginPwd"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 新增弹出框 -->
                <el-dialog title="新增" :visible.sync="addVisible" width="30%">
                    <el-form ref="form" :model="form" label-width="50px">
                        <el-form-item label="账号">
                            <el-input v-model="form.loginName"></el-input>
                        </el-form-item>
                        <el-form-item label="密码">
                           <el-input v-model="form.loginPwd"></el-input>
                         </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="addVisible = false">取 消</el-button>
                        <el-button type="primary" @click="saveAdd">确 定</el-button>
                    </span>
                </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'userTable',
        data() {
            return {
                url: '',
                tableData: [],
                cur_page: 1,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                editVisible: false,
                delVisible: false,
                addVisible:false,
                form: {
                    id:'',
                    loginName: '',
                    loginPwd:'',
                    isActive: '',
                    createTime: '',
                    updateTime:''
                },
                idx: -1,
                totalCount:10,
                selectId:-1
            }
        },
        created() {
            this.getData();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.post("user/list", {
                    pageIndex: this.cur_page,
                    searchWord: this.select_word
                }).then((res) => {
                    if(res != undefined && res.data.header.rspCode == 0){
                    this.tableData = res.data.body.userList;
                    this.totalCount = res.data.body.totalPage;
                    };
                })
            },
            search() {
                this.cur_page = 1;
                this.getData();
            },
            formatter(row, column) {
                return row.loginName;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            handleAdd(){
                this.addVisible = true;
            },
            saveAdd(){
                this.$axios.post('user/add',{
                     loginName:this.form.loginName,
                     loginPwd:this.form.loginPwd
                }).then((res) => {
                     if(res != undefined && res.data.body){
                        this.$message.success(`新增成功`);
                        this.addVisible = false;
                        this.getData();
                     }
                     else{
                        this.$message.success(`新增失败`);
                     }
                })
            },
            handleEdit(index, row) {
                this.selectId = row.id;
                const item = this.tableData[index];
                this.form = {
                    loginName: item.loginName,
                    loginPwd:item.loginPwd
                }
                this.editVisible = true;
            },
            // 保存编辑
            saveEdit() {
                this.$axios.post('user/edit',{
                     userId:this.selectId,
                     loginName:this.form.loginName,
                     loginPwd:this.form.loginPwd
                }).then((res) => {
                     if(res != undefined && res.data.body){
                        this.$message.success(`修改成功`);
                        this.editVisible = false;
                        this.getData();
                     }
                })
            },
             handleDelete(index, row) {
                 this.selectId = row.id;
                 this.delVisible = true;
             },
            // 确定删除
            deleteRow(){
               this.$axios.post('user/remove', {
                       userId:this.selectId
                    }).then((res)=> {
                       if(res != undefined && res.data.body){
                       this.$message.success('删除成功');
                       this.delVisible = false;
                       this.getData();
                    }else{
                       this.$message.success('删除失败');
                    }
                })
            }
        }
    }

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
    .del-dialog-cnt{
        font-size: 16px;
        text-align: center
    }
</style>

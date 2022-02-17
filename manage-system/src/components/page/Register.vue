<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">浩月后台管理系统</div>
            <el-form :model="param" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="输入用户名">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="输入密码" v-model="param.password">
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="checkpass">
                    <el-input
                        type="password"
                        placeholder="再次输入密码"
                        v-model="param.checkpass"
                        @keyup.enter.native="submitForm()"
                    >
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="gotoRegister()">注册</el-button>
                </div>
                <el-button type="info" icon="el-icon-arrow-left" @click="goLogin()">返回登录</el-button>
            </el-form>
        </div>
    </div>
</template>

<script>

import { USER } from '../../api/index';
export default {
    data: function() {
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
            } else {
                if(value.length  < 6) {
                    callback(new Error('密码至少为6位'))
                }
                if (this.param.checkpass !== '') {
                    this.$refs.ruleForm.validateField('checkpass');
                }
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.param.password) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };

        return {
            fullscreenLoading : false,
            param: {
                username: '',
                password: '',
                checkpass:''
            },
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ validator: validatePass, trigger: 'blur' }],
                checkpass: [{ validator: validatePass2, trigger: 'blur' }]
            }
        };
    },
    methods: {
        gotoRegister() {
            this.$refs.ruleForm.validate(valid => {
                if (valid) {
                    let fullloading = this.$loading({fullscreen: true})
                    USER.register({
                        email : this.param.username,
                        password : this.param.password
                    }).then(() => {
                        fullloading.close()
                        this.$message.success('注册成功');
                        this.$router.push('/Login');
                    }).catch((e) => {
                        this.$message.error(e || "注册失败");
                        console.log(e);
                        fullloading.close()
                    })
                } else {
                    this.$message.error('请正确填入信息');
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        goLogin(){
            this.$router.push("/Login")
        }
    }
};
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../../assets/img/login-bg.jpg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #0f1111;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
}
.login-btn button {
    width: 40%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: rgb(0, 110, 15);
    display: inline;
}
</style>
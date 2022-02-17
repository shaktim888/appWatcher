<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">浩月后台管理系统</div>
            <el-form :model="param" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="请输入用户名">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="请输入密码"
                        v-model="param.password"
                        @keyup.enter.native="submitForm()"
                    >
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="success" @click="gotoRegister()">注册</el-button>
                    <el-button type="primary" @click="submitForm()">登录</el-button>
                </div>
                <el-alert
                    title="tips : 用户名和密码随便填。"
                    type="success"
                    :closable="false">
                </el-alert>
            </el-form>
        </div>
    </div>
</template>

<script>
import { USER } from '../../api/index';
export default {
    data: function() {
        return {
            param: {
                username: '',
                password: '',
            },
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
            },
        };
    },
    methods: {
        submitForm() {
            this.$refs.login.validate(valid => {
                if (valid) {
                    let fullloading = this.$loading({fullscreen: true})
                    USER.login({
                        email : this.param.username,
                        password : this.param.password
                    }).then((data) => {
                        fullloading.close()
                        localStorage.setItem('ms_username', this.param.username);
                        localStorage.setItem('ms_token', data.token);
                        
                        this.$message.success('登录成功');
                        this.$router.push('/');
                    }).catch((e) => {
                        this.$message.error(e || "注册失败");
                        console.log(e);
                        fullloading.close()
                    })
                } else {
                    this.$message.error('请输入账号和密码');
                    console.log('error submit!!');
                    return false;
                }
            });
        },

        gotoRegister() {
            this.$router.push('/register');
        }
    },
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
    color: #fff;
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
    color: #fff;
}
</style>
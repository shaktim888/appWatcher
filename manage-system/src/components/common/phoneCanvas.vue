<template>
    <div ref="containDiv">
        <canvas ref='phone-canvas'></canvas>
    </div>
</template>

<script>
import bus from '../common/bus';
export default {
    data() {
        return {
            background:'#fff', // canvas的背景色
            ctx:null , // canvas的绘制上下文
            width : 0,
            height : 0,
        };
    },
    props : {
        landscape : {
            type: Boolean,
            required : true,
        },
        canvasWidth: {
            type: Number
        },
        canvasHeight : {
            type: Number
        },
        mobileWidth : {
            type: Number,
            required : true,
        },
        mobileHeight : {
            type: Number,
            required : true,
        },
        pos : {
            type:Array,
            required : true,
        }
    },
    watch:{
        pos(val) {
            this.draw()
        },
        landscape(val) {
            this.draw()
        },
    },
    methods: {
        draw(){ // 假设将球用平行于屏幕的平面切割，形成很多切面（这些切面都是圆形，且平行于屏幕，大小将根据z轴位置有所不同），计算并返还这些切面的圆心坐标xyz和半径，
            let moWidth = this.mobileWidth,moHeight = this.mobileHeight
            if(this.landscape) {
                if(moWidth < moHeight) {
                    let tmp =moWidth
                    moWidth = moHeight
                    moHeight = tmp
                }
            } else {
                if(moWidth > moHeight) {
                    let tmp =moWidth
                    moWidth = moHeight
                    moHeight = tmp
                }
            }
            console.log(moWidth, moHeight)
            this.canvas = this.$refs['phone-canvas'] ;
            this.width = this.canvasWidth || this.width
            this.height = this.canvasHeight || this.height
            this.canvas.width = this.width
            this.canvas.height = this.height
            this.canvas.style.background = this.background ;
            if(this.canvas.getContext){
                this.ctx = this.canvas.getContext('2d') ;
            }else{
                this.$message('您的浏览器不支持canvas绘画环境');
            }
            let scale = 1;
            if(moWidth > (this.width - 10)) {
                scale = Math.min((this.width - 10) / moWidth, scale)
            }
            if(moHeight > (this.height - 10)) {
                scale = Math.min((this.height - 10) / moHeight , scale)
            }
            this.ctx.clearRect(0,0,this.width,this.height) ;// 清除画布
            this.ctx.beginPath()
            this.ctx.rect(5,5,moWidth * scale,moHeight * scale) ;// 清除画布
            this.ctx.stroke();
            for(let p of this.pos) {
                this.ctx.beginPath()
                this.ctx.arc(p.x * scale + 5,p.y * scale + 5,5,0,2*Math.PI);
                this.ctx.stroke()
            }
        },
    },
    mounted() {
        let containDiv = this.$refs["containDiv"]
        this.width = this.canvasWidth || containDiv.offsetWidth
        this.height = this.canvasHeight || containDiv.offsetHeight
        this.draw()
    }
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}
.sidebar > ul {
    height: 100%;
}
</style>

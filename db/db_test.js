// 1. 引入mongoose
const mongoose = require('mongoose')

// 2. 链接数据库
mongoose.connect('mongodb://localhost:27017/gzhipin_test')

// 3. 获取链接对象
const con = mongoose.connection

// 4. 链接对象的监听
con.on('connected', function () {
    console.log("数据库链接成功")
})

// 一个md5的加密函数
const md5 = require('blueimp-md5')

// 定义Schema（描述文档结构）
const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    type: { type: String, required: true }
})
// 文档（一条记录）
// 集合（记录集合）

// UserModel是一个构造函数
const UserModel = mongoose.model('user', userSchema)

function testSave() {
    const userModel = new UserModel({
        username: 'Tom2',
        password: md5('123'),
        type: 'dashen'
    })
    userModel.save(function (error, user) {
        console.log('save', error, user)
    })
}

function testFind() {
    // 查询所有，得到的是一个数组
    UserModel.find(function (error, users) {
        console.log('find()', error, users)
    })
}
function testFindOne() {
    UserModel.findOne({ _id: '634d68029f7b3ca539206731' }, function (error, user) {
        console.log('findOne()', error, user)
    })
}
function testUpdate() {
    // 寻找到指定对象
    UserModel.findByIdAndUpdate({ _id: '634d68029f7b3ca539206731' }, { username: "jack" }, function (error, doc) {
        console.log('findByIdAndUpdate()', error, doc)
    })
}

function remove() {
    UserModel.deleteOne({ _id: '634d68029f7b3ca539206731' }, function (error, doc) {
        console.log('remove()', error, doc)
    })
}
// testSave()
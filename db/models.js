const mongoose = require('mongoose')

// 2. 链接数据库
mongoose.connect('mongodb://localhost:27017/gzhipin')

// 3. 获取链接对象
const con = mongoose.connection

// 4. 链接对象的监听
con.on('connected', function () {
    console.log("数据库链接成功")
})

const userSchema = mongoose.Schema({
    username: { type: String, require: true },
    password: { type: String, require: true },
    usertype: { type: String, require: true },
    header: { type: String },
    post: { type: String },
    info: { type: String },
    company: { type: String },
    salary: { type: String }
})

const UserModel = mongoose.model('user', userSchema)
// 导出构造函数
exports.UserModel = UserModel


const chatSchema = mongoose.Schema({
    form: {type: String, require: true},
    to: {type: String, require: true},
    chat_id:{type: String,require: true},
    content: {type: String,require: true},// 内容
    read: {type: Boolean, default: false},//标识是否已读
    create_time: {type: Number}
})

const ChatModel = mongoose.model('chat', chatSchema)
exports.ChatModel = ChatModel
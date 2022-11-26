

const {ChatModel} = require('../db/models')
module.exports = function (server) {
    const io = require('socket.io')(server)
    io.listen(4001)

    // 监视与客户端的链接
    io.on('connection', socket => {

        console.log("有一个客户端链接到了服务器")

        socket.on('sendMsg', function ({ from, to, content }) {
            const create_time = Date.now()
            const chat_id = [from, to].sort().join("-") 
            const chatMsg = { from, to, chat_id, content, create_time }
            
            console.log("这是即将要处理的消息2" + JSON.stringify(chatMsg))

            new ChatModel(chatMsg).save(function (error, chatMsgDoc) {
                // 发送给所有连接上的浏览器
                console.log("这里是没有写进去吗" + chatMsgDoc)
                // res.send()
                let res =  { code: 0, data: { chat: chatMsgDoc } }
                io.emit('receiveMsg', res)
            })
        })
    })
}


// new UserModel({ username, password: md5(password), usertype }).save(function (error, user) {
//     // 生成一个cookie,并设置有存活时间
//     res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
//     const data = { username, usertype, _id: user._id }
//     res.send({ code: 0, data })
//   })


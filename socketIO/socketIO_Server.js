
import {ChatModel} from '../db/models'

export default function (server) {
    const io = require('socket.io')(server)
    io.listen(4001)

    // 监视与客户端的链接
    io.on('connection', socket => {

        console.log("有一个客户端链接到了服务器")

        socket.on('sendMsg', function ({ from, to, content }) {
            console.log('服务器接收到浏览器的消息', { from, to, content })
            const chat_id =  [from, to].sort().join('_')
            const create_time = Date.now()
            new ChatModel({from, to, content, chat_id, create_time}).save(function(err,chatMsg){
                // 暂时向所有链接都发送消息
                console.log('服务器向到浏览器的消息', { from, to, content })
                io.emit("receiveMsg",chatMsg)
            })
        })
    })
}


var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const { UserModel, ChatModel } = require('../db/models');
const { route } = require('../app');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// 注册一个路由：用户注册
router.post('/register', function (req, res) {
  const { username, password, usertype } = req.body
  // 读取请求参数数据
  UserModel.findOne({ username }, function (err, user) {
    if (user) {
      res.send({
        code: 1,
        msg: '此用户已经存在'
      })
    } else {
      new UserModel({ username, password: md5(password), usertype }).save(function (error, user) {
        // 生成一个cookie,并设置有存活时间
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
        const data = { username, usertype, _id: user._id }
        res.send({ code: 0, data })
      })
    }
  })
})
// 登录路由
router.post('/login', function (req, res) {
  const { username, password } = req.body
  UserModel.findOne({ username, password: md5(password) }, function (error, user) {
    // 如果用户存在
    if (user) {
      res.cookie('userid', user._id.toString(), { maxAge: 1000 * 60 * 60 * 24 * 7 })
      res.send({
        code: 0,
        data: user
      })
    } else {
      // 如果用户不存在
      res.send({
        code: 1,
        msg: '用户名或者密码不正确'
      })
    }
  })
})

router.post('/update', function (req, res) {
  // 浏览器会把cookies回给服务器
  const userid = req.cookies.userid
  if (!userid) {
    return res.send({ code: 1, msg: '请先登录' })
  }
  const user = req.body
  // 通过id找到用户，更新user用户，设置回调
  UserModel.findByIdAndUpdate({ _id: userid }, user, function (error, oldUser) {
    if (!oldUser) {
      // cookie已经失效，通知浏览器删除
      res.clearCookie('userid')
      res.send({ code: 1, msg: '请先登录' })
    } else {
      const { _id, username, usertype } = oldUser
      const data = Object.assign(user, { _id, username, usertype })
      res.send({ code: 0, data })
    }
  })
})

router.get('/user', function (req, res) {
  const userid = req.cookies.userid
  console.log("这是收到的" + userid)
  if (!userid) {
    return res.send({ code: 1, msg: '请先登录' })
  }
  UserModel.findOne({ _id: userid }, function (error, user) {
    res.send({ code: 0, data: user })
  })
})

// 根据用户类型获取
router.get('/getUserList', function (req, res) {
  console.log("俩了吗")
  const { usertype } = req.query
  UserModel.find({ usertype }, function (error, users) {
    res.send({ code: 0, data: users })
  })
})
module.exports = router;

// 获取消息列表
router.get('/msgList', function (req, res) {
  const userid = req.cookies.userid
  // 获取所有的用户
  UserModel.find(function (err, userDocs) {
    const users = {}
    userDocs.forEach(doc => {
      users[doc._id] = { username: doc.username, header: doc.header }
    })
    console.log("即将要返回给服务器的" + JSON.stringify(users))


    // 与我相关所有消息
    ChatModel.find({ '$or': [{ from: userid }, { to: userid }] }, function (err, chats) {
      res.send({ code: 0, data: { users, chats } })
    })
  })
})

// 标记该消息已经读取
router.post('/readmsg', function (req, res) {
  const from = req.body.from
  const to = req.cookies.userid
  ChatModel.update({ from, to, read: false }, { read: true }, { multi: true }, function (err, doc) {
    console.log("read msg" + doc)
    res.send({ code: 0, data: doc.nModified })
  })

})
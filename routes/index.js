var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
const { UserModel } = require('../db/models')

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// 注册一个路由：用户注册
router.post('/register', function (req, res) {
  const { username, password, type } = req.body
  // 读取请求参数数据
  UserModel.findOne({ username }, function (err, user) {
    if (user) {
      res.send({
        code: 1,
        msg: '此用户已经存在'
      })
    } else {
      new UserModel({ username, password: md5(password), type }).save(function (error, user) {
        // 生成一个cookie,并设置有存活时间
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
        const data = { username, type, _id: user._id }
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
      res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
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
      const { _id, username, type } = oldUser
      const data = Object.assign(user, { _id, username, type })
      res.send({ code: 0, data })
    }
  })
})

module.exports = router;

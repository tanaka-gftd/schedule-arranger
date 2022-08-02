/* ログインページ用のRouterモジュール */

'use strict';
const express = require('express');
const router = express.Router();

/* ここで設定した'/'はapp.jsのapp.useで設定したパス以降のパスを示す */
router.get('/', (req, res, next) => {
  //login.pugテンプレートを使用し、テンプレートに嵌め込む値も渡す
  res.render('login', { user: req.user });  
});

module.exports = router;
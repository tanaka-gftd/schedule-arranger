/* ログインアウトページ用のRouterモジュール */

'use strict';
const express = require('express');
const router = express.Router();

/* ここで設定した'/'はapp.jsのapp.useで設定したパス以降のパスを示す */
router.get('/', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);  //エラー発生時はExpressにエラーオブジェクトを渡す
    res.redirect('/');  //ログアウト処理後はtopページへ
  });
});

module.exports = router;
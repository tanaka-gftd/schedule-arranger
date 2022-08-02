/* 本アプリの中心となるモジュール */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//helmet...セキュリティ強化のためのモジュール
const helmet = require('helmet');  

//express-session... Express でセッションを利用できるようにするためのモジュール
const session = require('express-session');

//passport...Webサービスとの外部認証を組み込むためのプラットフォームとなるライブラリ
const passport = require('passport');  

//passport-github2モジュールからStrategyオブジェクトを取得
const GitHubStrategy = require('passport-github2').Strategy;

const GITHUB_CLIENT_ID = 'ab225d26a9a6ca8f0e4d';  /* ClientIDを記入*/
const GITHUB_CLIENT_SECRET = 'a7b54f776b732092f7692eacb3c105f85eef8077';  /* ClientSecretを記入 */

//ユーザの情報をデータとして保存する処理
/* こkではユーザ情報の全てをそのままオブジェクトとしてセッションに保存 */
passport.serializeUser(function (user, done) {
  done(null, user);  //done関数,,,第一引数にはエラー、第二引数には結果を設定
});

//保存されたデータをユーザの情報として読み出す際の処理
/* ここでは保存されたユーザ情報を、そのまま全てを読みだす */
passport.deserializeUser(function (obj, done) {
  done(null, obj);  //done関数,,,第一引数にはエラー、第二引数には結果を設定
});


//passportモジュールに、 GitHubを利用した認証のStrategyオブジェクトを設定
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:8000/auth/github/callback'
    },
    //認証後に実行する処理を、 process.nextTick関数を利用して設定
    function (accessToken, refreshToken, profile, done){
      process.nextTick(function () {
        return done(null, profile);  //done関数,,,第一引数にはエラー、第二引数には結果を設定
    });
  }
));

//ルータモジュールの読み込み
var indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');

//ExpressAPIの作成
var app = express();

//helmetでセキュリティ強化
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({ 
    secret: 'a05fc7e4ece37c64', // node -e "console.log(require('crypto').randomBytes(8).toString('hex'));" で作成したランダムな文字列(セッションID作成のための秘密鍵)
    resave: false,  //セッションはストアには保存しない
    saveUninitialized: false  //セッションが初期化されていなくても初期化しない
  })
);
app.use(passport.initialize());
app.use(passport.session());

//パス名と使用するモジュールを関連づける
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);

//Github認証のための処理
//GETメソッドで/auth/githubにアクセスした際に実行する
app.get('/auth/github', 
    passport.authenticate('github', { scope: ['user:email'] }),  //GithubのOAuthで認可される権限の範囲を設定（今回はEmailアドレス）
    function (req, res) {
      /* リクエストが行われた際の処理（認証のログ出力とか）をここに記載する（今回は何もしない）*/
    }
);

//Githubが利用者の許可に対する問い合わせの結果を送るパスと、その際の処理を設定
app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),  //ログイン失敗時は再ログインを促すためにログイン画面に再度遷移
    function(req,res){
      res.redirect('/');  //ログイン成功時はtopページに遷移
    }
);

//存在しないパスへのアクセスがあった際の処理
app.use(function(req, res, next) {
  next(createError(404));  //ステータスコード404
});

//エラー処理
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;

  //開発時はエラーオブジェクト（エラーのスタックトレース）をテンプレートに渡し、本番時は何も渡さないようにする
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  //エラーページ（error.pugテンプレートを使用）をレンダリング（レンダリングできない時はステータスコード500）
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

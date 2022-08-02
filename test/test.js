/* Jestを利用したテスト用モジュール */

'use strict';

const request = require('supertest');  //supertest...テスト内でExpressのサーバを起動することなく、 Routerの挙動をテストできるモジュール
const passportStub = require('passport-stub');  //passport-Stub...認証のログイン・ログアウト処理をテスト内で模倣できるモジュール


//テスト対象となるapp.jsを読み込む
const app = require('../app');  

describe('/login', () => {

  //JestのbeforeAll関数...記述された処理はdescribe内のテスト前に実行される
  beforeAll(() => {
    passportStub.install(app);  //passportStubをappオブジェクトにインストール
    passportStub.login({ username: 'testuser' });  //testuserというユーザ名でログイン
  });

  //JestのafterAll関数...記述された処理はdescribe内のテスト後に実行される
  afterAll(() => {
    passportStub.logout();  //testuserアカウントからログアウト
    passportStub.uninstall();  //passportStubに設定したオブジェクト(ここではapp)にアンインストール
  });

  //テスト１
  test('ログインのためのリンクが含まれる', async() => {
    await request(app)  //リクエスト対象となるモジュールを指定
      .get('/login')  //リクエストのメソッド（ここではGETメソッド）と、リクエスト先パス（ここでは /login）を指定
      .expect('Content-Type', 'text/html; charset=utf-8')  //except関数で、ヘッダの値を確認
      .expect(/<a href="\/auth\/github">/)  //except関数と正規表現を用いて、指定したHTML要素がbody部にあるかを確認
      .expect(200);  //テスト終了時には、期待されるステータスコードの整数をexcept関数に渡す

      /* 
        以上で設定したテストは、/loginにアクセスした際、
          ●レスポンスヘッダの 'Content-Type' が text/html; charset=utf-8 であること
          ●<a href="/auth/github" が HTML に含まれること
          ●ステータスコードが 200 OK で返る
        の3点が満たされているかを確認するものとなっている
      */
  });

  //テスト２
  test('ログイン時はユーザ名が表示される', async() => {
    await request(app)
      .get('/login')
      .expect(/testuser/)
      .expect(200)

      /* 
        このテストでは
          ●/login にアクセスした後、 そのHTMLのbody内に、testuserという文字列が含まれる
        ということを確認している
      */
  })
});
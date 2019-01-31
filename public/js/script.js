$(function(){
  var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
  // var usersRef    = firebase.database().ref('/users/');
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {//ユーザーがログインしていれば実行
      var userName = user.displayName;
      var uid = user.uid;
      // writeUserData(uid,userName);//ユーザーの情報を登録(削除)
        console.log(user);
        $('.modal').modal();
        $('select').formSelect();
        $('.sidenav').sidenav();
        $('input#messageInput,#text1').characterCounter();

        $('.side-user-name').text(user.displayName);//サイドバーのユーザー名
        $('#name').val(user.displayName);//設定画面のユーザー名
        $('#email').val(user.email);//設定画面のemail

        $('#messageInput').keypress(function (e) {//enterでも反応させる
          if (e.keyCode == 13) {
            $('.comment').click();
          }
        });
        $('#modal-btn').click(function(){//モーダル展開
          $('.comment').show();
          $('.edit-btn').hide();
          $('#modalMain').show();
          $('#btn-list').hide();

          // console.log($('#modalMain')[0]);
          // console.log(document.getElementById('modalMain'));

        });

        $('#modal-switch').click(function(){
          $('#modalMain').hide();
          $('#btn-list').show();
        });

        $('.comment').click(function(){//コメントをfirebaseに保存
            var text = $('#messageInput').val();
            if (text.length <= 250 && text) {
              var time = moment().format('YYYY-MM-DD HH:mm');
              var uid  = user.uid;
              messagesRef.push({text:text,time:time,uid:uid});
              $('#messageInput').val('');
              $('.modal-close').click();
            }
        });

        // $('.timeline-user-icon').click(function() {//アイコンを押したらアイコンの人のプロフィールを表示する機能作りかけ
        //   var itemKey = $(this).parents(".timeline-user-id").text;
        //   console.log(itemKey);
        // });

        $('.original-btn3').click(function() {//どうでも良いねボタンの処理
          var itemKey = $(this).parents(".timeline-card").data('key');
          console.log($(this).hasClass('changed'));
          if ($(this).hasClass('changed')) {//いいねを押して居たら削除
            firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`).remove();
          } else {//押していなければ追加
            writeButtonData(itemKey,user);
          }
        });

        $('.edit-text').on('click',function() {//編集処理（未実装）
          const itemKey = $(this).data('key');
          $('.edit-btn').show();
          $('.comment').hide();
          $('#modalMain').show();
          $('#btn-list').hide();
          $('.edit-btn').click(function(){
            var text = $('#messageInput').val();
            var time = moment().format('YYYY-MM-DD HH:mm');
            writeNewPost(text,itemKey,time);
            $('#messageInput').val('');
          });
        });

        $('.delete-text').click(function(){//カードの削除
          var card = $(this).parents(".timeline-card");
            const itemKey = $(card).data('key');
            messagesRef.child(itemKey).remove();
        });
        /*表示*/
        messagesRef.on('child_added', function (snapshot) {//メッセージを追加（リアルタイム）
            var message    = snapshot.val();
            var messageKey = snapshot.key;
            var formatDate = message.time;
            // console.log(message);
            const uid = message.uid;
            firebase.database().ref(`/users/${uid}`).once('value').then(function(snapshot){
              var displayName = snapshot.val().username;
              var taskcopy = createcard(message,messageKey,formatDate,displayName,user,uid);
              taskcopy.prependTo($('#messagesDiv'));
            });
        });
        messagesRef.on('child_removed', function (snapshot) {//メッセージを削除（リアルタイム）
          var value = snapshot.val();
          // key取得
          var key = snapshot.key;
          // keyをもとにDOM検索
          var item = $(`[data-key=${key}]`)[0];
          console.log(item);
          item.remove();
        });
        /**
         *アイコン画面の変更
         */
          $("#upfile").change(function(){
          var fileName = document.getElementById("upfile").files[0].name;//fail名
          var image = document.getElementById("upfile").files[0]
          var upImageRef = firebase.storage().ref(`/userIcon/${uid}`).child(fileName);
          upImageRef.put(image).then(function(snapshot) {
            console.log('Uploaded a blob or file!');
            firebase.database().ref(`/users/${uid}`).set({username:userName,iconImage:fileName});//ユーザにアイコン名を保存
          });
          firebase.storage().ref(`/userIcon/${uid}/${fileName}`).getDownloadURL().then((url) => {
            $('.side-user-icon , .timeline-user-icon , .mypage-user-icon ,.side-user-icon').css('background-image','url(' + url + ')');
          }).catch((error) => {
            // 変更したアイコンがない場合
            var imagesRef = firebase.storage().ref('dummy.jpg');
            imagesRef.getDownloadURL().then((url) => {
           $('.side-user-icon , .timeline-user-icon , .mypage-user-icon ,.side-user-icon').css('background-image','url(' + url + ')');
        });
        var imagesRef = firebase.storage().ref('dummy.jpg');
        // 初期アイコンを全てにコメントに表示
        imagesRef.getDownloadURL().then((url) => {
        cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
        $('.side-user-icon,.mypage-user-icon,side-user-icon ').css('background-image','url(' + url + ')');
        });

          });
        });
      }else{
        $(".container").hide();
        $(".material-icons").hide();
        // No user is signed in.
        // FirebaseUIインスタンス初期化
        var ui = new firebaseui.auth.AuthUI(firebase.auth());

        // FirebaseUIの各種設定
        var uiConfig = {
          callbacks: {
            signInSuccess: function(currentUser, credential, redirectUrl) {

              // サインイン成功時のコールバック関数
              // 戻り値で自動的にリダイレクトするかどうかを指定
              return true;
            },
            uiShown: function() {
              // FirebaseUIウィジェット描画完了時のコールバック関数
              // 読込中で表示しているローダー要素を消す
            }
          },
          // リダイレクトではなく、ポップアップでサインインフローを表示
          signInFlow: 'popup',
          signInSuccessUrl: 'index.html',
          signInOptions: [
            // サポートするプロバイダ(メールアドレス)を指定
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
          ],
          // Terms of service url.(サービス利用規約ページの)
          tosUrl: '<your-tos-url>'
        };

          // FirebaseUI描画開始
          ui.start('#firebaseui-auth-container', uiConfig);

      }
    });
});

//ユーザの名前をusersに保存する
function writeUserData(userId, name,) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    //email: email,
    //profile_picture : imageUrl
  });
}

function writeButtonData(itemKey,user) {//どうでも良いねボタンを押したuserをデータに保存
  firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`).set({
    good: user.displayName,
  });
}

function writeNewPost(text,itemKey,time) {//編集処理（未実装）
  // A post entry.
  var postData = {
    text: text,
    time: time,
  };

  var updates = {};
  updates[itemKey] = postData;
  // updates['/user-posts/' + itemKey] = postData;
  return messagesRef.update(updates);
}

function createcard(message,messageKey,formatDate,displayName,user,uid) {//カードを作成
  // console.log(formatDate);
  var cloneTask = $('#cardDamy').find('div.card').clone(true);
  cloneTask.attr('data-key',messageKey);
  cloneTask.attr('data-uid',uid);
  // console.log(messageKey);
  cloneTask.find('.textMain').text(message.text);
  cloneTask.find('.timeline-user-name').text(displayName);//名前の表示
  cloneTask.find('.timeline-user-id').text('id:' + uid);//IDの表示

  /** コメントにアイコンを表示する*/
  firebase.database().ref(`/users/${uid}/iconImage`).once('value').then(function(snapshot) {
    var flug = snapshot.val()
    console.log(flug);
    if(flug != null){
      firebase.storage().ref(`/userIcon/${uid}/${flug}`).getDownloadURL().then((url) => {
        cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
        $('.side-user-icon,.mypage-user-icon,side-user-icon ').css('background-image','url(' + url + ')');
      });
    }else{
      var imagesRef = firebase.storage().ref('dummy.jpg');
      // 初期アイコンを全てにコメントに表示
      imagesRef.getDownloadURL().then((url) => {
      cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
      });
    }
  });

  firebase.database().ref('/tasks/' + messageKey + '/users').on('value', function (snapshot) {//ボタン
    var likecount    = snapshot.numChildren();//どうでも良いねが押された数
    var opacitycount = 1.0 - likecount / 10;//opacityを0.1ずつ変更
    cloneTask.find('.gooduser').text(likecount);
    cloneTask.find('.card-body').css({
        opacity: opacitycount,
    });
    firebase.database().ref('/tasks/' + messageKey + '/users/' + user.uid).once('value', function (snapshot) {//ボタン
      // console.log(snapshot.numChildren());
      var likeuser = snapshot.numChildren();
      if (likeuser) {//ボタンを押したユーザーの中に自分がいるかを判定
        cloneTask.find('.like').addClass('changed');//居ればクラス追加
      } else {
        cloneTask.find('.like').removeClass('changed');//居なければ削除
      }
    });
  });
  // cloneTask.find('.delete-text').attr('data-key',messageKey);
  // cloneTask.find('.edit-text').attr('data-key',messageKey);
  cloneTask.find('.now').text(formatDate);

  return cloneTask;
}
/**
 * ログアウト処理
 */
function logout(){
    if(confirm("ログアウトしても宜しいですか？")){
      alert("ログアウトします");
      firebase.auth().signOut().then(function() {
      }).catch(function(error) {
        console.log(error);
        console.log("ログアウトに失敗しました");
      });
      $(".container").hide();
      $(".material-icons").hide();
    }else{
      alert("キャンセルしました");
    }
}
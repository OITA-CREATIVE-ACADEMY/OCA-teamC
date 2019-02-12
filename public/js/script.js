$(function(){
  var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
  // var usersRef    = firebase.database().ref('/users/');
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {//ユーザーがログインしていれば実行
      var userName = user.displayName;
      var uid = user.uid;
      var email = user.email;
      firebase.database().ref('users/' + uid).once('value', function (snapshot) {//ユーザー情報の判定
        var count = snapshot.numChildren();
        var sex   = snapshot.val().sex;
        var text  = snapshot.val().text;
        $('#textarea1').val(text);
          $('#' + sex).prop("checked", true);
          if (count = 0) {//初ログインの人のみ登録
            var sex = 'other';
            var iconImage = '画像なし';
            writeUserData(uid,userName,email,sex,iconImage);//ユーザーの情報を登録
          }
        });
        console.log(user);
        $('.modal').modal();
        $('.sidenav').sidenav();
        $('#messageInput,#text1,#textarea1').characterCounter();
        $('.side-user-name').text(userName);//サイドバーのユーザー名
        $('.name').val(userName);//設定画面のユーザー名
        $('#email').val(email);//設定画面のemail
        if (window.localStorage.getItem('selectedUsers')) {
          $('.name').val(window.localStorage.getItem('selectedUsers'));//設定画面のユーザー名
          var selectedUid = window.localStorage.getItem('selectedUid');
          if (selectedUid !== user.uid) {//自分以外のユーザーだったら
            $('.myName').addClass('hide');
            $('#textarea1').parent().parent().remove();
            $('.otherName').removeClass('hide');
            firebase.database().ref('users/' + selectedUid).on('value', function (snapshot) {//ユーザー情報の判定
              var sex  = snapshot.val().sex;
              var text = snapshot.val().text;
              console.log(text);
              $('#textarea2').text(text);//2に変更
              // $('#textarea1').val(text);
              // $('#textarea1').prop("disabled", true);
              $('#' + sex).prop("checked", true);
              $("input[name=group1]:not(:checked)").parents(".input-type-radio").hide();
              });
          } else {
            $('.userEmail').removeClass('hide');
          }
        }
        $('.savebtn').click(function(){
          var myName = $('.name').val();
          var radiobtn = $('input[name=group1]:checked').val();
          var textarea = $('#textarea1').val();
          console.log(user);
          user.updateProfile({
            displayName: myName,
            }).then(function() {
              // Update successful.
              firebase.database().ref('users/' + uid).update({
                username: myName,
                email: email,
                sex: radiobtn,
                text: textarea,
              });



              var fileName = $("#upfile")[0].files[0].name;//file名
              var image = $("#upfile")[0].files[0];
              var upImageRef = firebase.storage().ref(`/userIcon/${uid}`).child(fileName);
              upImageRef.put(image).then(function(snapshot) {
                console.log('Uploaded a blob or file!');
                firebase.database().ref(`/users/${uid}`).update({iconImage:fileName});//ユーザにアイコン名を保存
              });
              firebase.storage().ref(`/userIcon/${uid}/${fileName}`).getDownloadURL().then((url) => {
                $('.mypage-user-icon').css('background-image','url(' + url + ')');
              }).catch((error) => {
                // 変更したアイコンがない場合
                var imagesRef = firebase.storage().ref('dummy.jpg');
                imagesRef.getDownloadURL().then((url) => {
                  $('.mypage-user-icon').css('background-image','url(' + url + ')');
                });
                var imagesRef = firebase.storage().ref('dummy.jpg');
                // 初期アイコンを全てにコメントに表示
                imagesRef.getDownloadURL().then((url) => {
                cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
                $('.mypage-user-icon').css('background-image','url(' + url + ')');
                });
              });





              window.localStorage.setItem('selectedUsers', myName);
              location.reload();
            }).catch(function(error) {
              // An error happened.
              console.log(error);
              alert('エラーが発生しました');
          });
        });



        /**アイコン表示 */
        firebase.database().ref(`/users/${uid}`).once('value').then(function(snapshot) {
          var flug = snapshot.val().iconImage;
          console.log(flug);
          if(flug !== '画像なし'){
            firebase.storage().ref(`/userIcon/${uid}/${flug}`).getDownloadURL().then((url) => {
              $('.side-user-icon , .mypage-user-icon').css('background-image','url(' + url + ')');
            });
          }else{
            var imagesRef = firebase.storage().ref('dummy.jpg');
            // 初期アイコンを全てにコメントに表示
            imagesRef.getDownloadURL().then((url) => {
             $('.side-user-icon , .mypage-user-icon').css('background-image','url(' + url + ')');
            });
          }
        });

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
        });

        $('#modal-switch').click(function(){
          $('#modalMain').hide();
          $('#btn-list').show();
        });

        $('.comment').click(function(){//コメントをfirebaseに保存
            var text = $('#messageInput').val();
            if (text.length <= 250 && text) {
              var time = moment().format('YYYY-MM-DD HH:mm');
              // var uid  = user.uid;
              messagesRef.push({text:text,time:time,uid:uid});
              $('#messageInput').val('');
              $('.modal-close').click();
            }
        });

        $('.userSetting').click(function() {//ユーザー設定に飛ぶときの処理
          window.localStorage.setItem('selectedUsers', userName);//ローカルストレージに一時的に保存
          window.localStorage.setItem('selectedUid', user.uid);
          window.location.href = "mypage/index.html";
        });

        $('.timeline-user-icon').click(function() {//アイコンを押したらアイコンの人のプロフィールを表示
          var itemKey = $(this).parents(".timeline-card").data('uid');
          console.log(itemKey);
          var otherUsers = firebase.database().ref('/users/' + itemKey);
          otherUsers.once('value').then(function(snapshot){
            var Name  = snapshot.val().username;
            window.localStorage.setItem('selectedUsers', Name);//ローカルストレージに一時的に保存
            window.localStorage.setItem('selectedUid', itemKey);
            window.location.href = "mypage/index.html";
          });
        });

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
          var image = $("#upfile")[0].files[0];
          $("#upfile").value(image);
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
function writeUserData(userId, name, email, sex, iconImage) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    sex: sex,
    iconImage: iconImage,
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
   if (uid === user.uid) {
     cloneTask.find('.branch').addClass('alteration');//コメントが自分のものであればクラスを追加
   }
  console.log(messageKey);
  cloneTask.attr('data-uid',uid);
  cloneTask.find('.textMain').text(message.text);
  cloneTask.find('.timeline-user-name').text(displayName);//名前の表示
  cloneTask.find('.timeline-user-id').text('id:' + uid);//IDの表示

  /** コメントにアイコンを表示する*/
  firebase.database().ref(`/users/${uid}`).once('value').then(function(snapshot) {
    var flug = snapshot.val().iconImage;
    console.log(flug);
    if(flug !== '画像なし'){
      firebase.storage().ref(`/userIcon/${uid}/${flug}`).getDownloadURL().then((url) => {
        cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
      });
    }else{
      var imagesRef = firebase.storage().ref('dummy.jpg');
      // 初期アイコンを全てにコメントに表示
      imagesRef.getDownloadURL().then((url) => {
        console.log(url);
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
        $(".container").hide();
        $(".material-icons").hide();
        window.localStorage.removeItem('selectedUsers');
        window.localStorage.removeItem('selectedUid');
        location.href = 'index.html';
      }).catch(function(error) {
        console.log(error);
        console.log("ログアウトに失敗しました");
      });
    }else{
      alert("キャンセルしました");
    }
}

$(function(){
  var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
  // var usersRef    = firebase.database().ref('/users/');


  firebase.auth().onAuthStateChanged(function(user) {
    console.log('ログイン状態チェック');


    if (user) {
      var userName = user.displayName;
      var uid = user.uid;
      writeUserData(uid,userName);
        console.log(user);
        $('.modal').modal();
        $('select').formSelect();
        $('.sidenav').sidenav();
        $('input#messageInput').characterCounter();

        $('#messageInput').keypress(function (e) {//enterでも反応させる
          if (e.keyCode == 13) {
            $('.comment').click();
          }
        });
        $('#modal-btn').click(function(){
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

        $('.comment').click(function(){//テキストと時間の取得
            var text = $('#messageInput').val();
            if (text.length <= 250 && text) {
              var time = moment().format('YYYY-MM-DD HH:mm');
              var uid  = user.uid;
              messagesRef.push({text:text,time:time,uid:uid});
              $('#messageInput').val('');
            }
        });

        $('.original-btn3').click(function() {
          var itemKey = $(this).parents(".timeline-card").data('key');
          console.log(firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`));
          // if (firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`)) {
          //   firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`).remove();
          // } else {
            writeButtonData(itemKey,user);
          // }



          // messagesRef.child(itemKey + "/good/" + user.uid).remove();
          // console.log(firebase.database().ref('/tasks/' + itemKey + '/users'));
        });

        $('.edit-text').on('click',function() {
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
        messagesRef.on('child_added', function (snapshot) {//メッセージを追加する時に自動発火
            var message    = snapshot.val();
            var messageKey = snapshot.key;
            var formatDate = message.time;
            console.log(message);
            const uid = message.uid;
            firebase.database().ref(`/users/${uid}`).once('value').then(function(snapshot){//メッセージに変更がある時一度だけ変更を加える
              var displayName = snapshot.val().username;
              var taskcopy = createcard(message,messageKey,formatDate,displayName,user);
              taskcopy.appendTo($('#messagesDiv'));
            });
        });
        messagesRef.on('child_removed', function (snapshot) {//メッセージを削除する時に自動発火
          var value = snapshot.val();
          // key取得
          var key = snapshot.key;
          // keyをもとにDOM検索
          var item = $(`[data-key=${key}]`)[0];
          console.log(item);
          item.remove();
      });
      }else{
        console.log('ログインしていない');

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
  }, function(error) {
    if (error) {
      console.log('error: ' + error);
      // The write failed...
    } else {

      // Data saved successfully!
    }
  });
  // firebase.database().ref('/tasks/' + itemKey + '/users').push({
  //   good: user.uid,
  // });
  // console.log(
  // firebase.database().ref('/tasks/' + itemKey + '/users').orderByKey()
  //
  // );
}


// firebase.database().ref('/tasks/' + itemKey + '/users').on('child_added', function (snapshot) {//メッセージを削除する時に自動発火
//   var value = snapshot.val();
//
// });


function writeNewPost(text,itemKey,time) {
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

function createcard(message,messageKey,formatDate,displayName,user) {//カードを作成
  console.log(formatDate);
  var cloneTask = $('#cardDamy').find('div.card').clone(true);
  cloneTask.attr('data-key',messageKey);
  console.log(messageKey);
  cloneTask.find('.textMain').text(message.text);
  cloneTask.find('.timeline-user-name').text(displayName);
  firebase.database().ref('/tasks/' + messageKey + '/users/' + user.uid).once('value', function (snapshot) {//ボタン
    console.log(snapshot.numChildren());
  });
  firebase.database().ref('/tasks/' + messageKey + '/users').on('value', function (snapshot) {//ボタン
    console.log(snapshot.numChildren());
    cloneTask.find('.gooduser').text(snapshot.numChildren());
  });
  // cloneTask.find('.delete-text').attr('data-key',messageKey);
  // cloneTask.find('.edit-text').attr('data-key',messageKey);
  cloneTask.find('.now').text(formatDate);

  return cloneTask;
}

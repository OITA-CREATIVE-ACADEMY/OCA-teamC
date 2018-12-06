$(function(){
  var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
  var usersRef    = firebase.database().ref('/users/');

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
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
        });

        $('#modal-switch').click(function(){
          $('#modalMain').hide();
          $('#btn-list').show();
        });

        $('.comment').click(function(){//テキストと時間の取得
            var text = $('#messageInput').val();
            if (text.length <= 250) {
              var time = moment().format('YYYY-MM-DD HH:mm');
              var uid  = user.uid;
              messagesRef.push({text:text,time:time,uid:uid});
              $('#messageInput').val('');
            }
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
            const itemKey = $(this).data('key');
            messagesRef.child(itemKey).remove();
           // $(this).parents('.text-item').remove();
        });
        /*表示*/
        messagesRef.on('value', function (snapshot) { //イベントハンドラ、dataabaseに接続している
          $('#messagesDiv').empty();
          snapshot.forEach(function(childSnapshot) {
          var messageKey = childSnapshot.key;
          var message = childSnapshot.val();
          var formatDate = childSnapshot.time;
          var displayName = user.displayName;
          if (message) {
            var taskcopy = createcard(message,messageKey,formatDate,displayName);
            taskcopy.appendTo($('#messagesDiv'));
          }
          });
        });
      }else{
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

function createcard(message,messageKey,formatDate,displayName) {//カードを作成
  console.log(formatDate);
  var cloneTask = $('#cardDamy').find('div.card').clone(true);
  cloneTask.attr('data-key',messageKey);
  console.log(messageKey);
  cloneTask.find('.textMain').text(message.text);
  cloneTask.find('.timeline-user-name').text(displayName);
  cloneTask.find('.delete-text').attr('data-key',messageKey);
  cloneTask.find('.edit-text').attr('data-key',messageKey);
  cloneTask.find('.now').text(formatDate);

  return cloneTask;
}

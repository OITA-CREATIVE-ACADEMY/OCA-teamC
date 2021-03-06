$(function(){
  var messagesRef = firebase.database().ref('/tasks/');
  // var usersRef    = firebase.database().ref('/users/');
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {//ユーザーがログインしていれば実行
      console.log(user);
      var userName = user.displayName;//自分の名前
      var uid = user.uid;//自分のID
      var email = user.email;//自分のメールアドレス
      $('.side-user-name').text(user.displayName);//サイドバーのユーザー名
      $('.side-user-id').text('@' + uid);//サイドバーのIDの表示
      firebase.database().ref('users/' + uid).once('value', function (snapshot) {//ユーザー情報の判定
        var icon  = snapshot.val().iconImage;//アイコンのurlを取得
          sideIcon(user,icon,uid);//サイドバーに自分のアイコンを表示
        });
        $('.modal').modal();//モーダルを使う為の記述
        $('.sidenav').sidenav();//サイドバーを使う為の記述
        $('#messageInput,#text1').characterCounter();//文字数カウントの処理
        $('.side-user-name').text(userName);//サイドバーのユーザー名
        // $('#messageInput').keypress(function (e) {//enterでも反応させる
        //   if (e.keyCode == 13) {
        //     $('.comment').click();
        //   }
        // });
        $('#modal-btn').click(function(){//モーダル展開
          $('.comment').show();
          $('.edit-btn').hide();
          $('#modalMain').show();
          $('#btn-list').hide();
        });

        $('#modal-switch').click(function(){//ボタン追加画面に変更
          $('#modalMain').hide();
          $('#btn-list').show();
        });

        $('.userSetting').click(function() {//ユーザー設定に飛ぶときの処理
          window.localStorage.setItem('selectedUid', user.uid);//ローカルストレージにユーザーの情報を保存
          window.location.href = "mypage/index.html";//画面遷移
        });

        $('.timeline-user-icon').click(function() {//アイコンを押したらアイコンの人のプロフィールを表示
          var itemKey = $(this).parents(".timeline-card").data('uid');//コメントした人のIDを取得
          var otherUsers = firebase.database().ref('/users/' + itemKey);
          otherUsers.once('value').then(function(snapshot){//IDを元にfirebaseから検索
            var Name  = snapshot.val().username;//ユーザー名を取得
            window.localStorage.setItem('selectedUid', itemKey);//ローカルストレージにユーザーの情報を保存
            window.location.href = "mypage/index.html";//画面遷移
          });
        });

        $('.original-btn1').click(function() {//どうでも良いねボタンの処理
          var itemKey = $(this).parents(".timeline-card").data('key');
          if ($(this).hasClass('changed')) {//いいねを押して居たら削除
            firebase.database().ref('/tasks/' + itemKey + `/button1-user/${user.uid}`).remove();
          } else {//押していなければ追加
            writeButtonData1(itemKey,user);
          }
        });

        $('.original-btn2').click(function() {//どうでも良いねボタンの処理
          var itemKey = $(this).parents(".timeline-card").data('key');
          if ($(this).hasClass('changed')) {//いいねを押して居たら削除
            firebase.database().ref('/tasks/' + itemKey + `/button2-user/${user.uid}`).remove();
          } else {//押していなければ追加
            writeButtonData2(itemKey,user);
          }
        });


        $('.original-btn3').click(function() {//どうでも良いねボタンの処理
          var itemKey = $(this).parents(".timeline-card").data('key');
          if ($(this).hasClass('changed')) {//いいねを押して居たら削除
            firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`).remove();
          } else {//押していなければ追加
            writeButtonData(itemKey,user);
          }
        });

        // $('.edit-text').on('click',function() {//編集処理（未実装）
        //   const itemKey = $(this).data('key');
        //   $('.edit-btn').show();
        //   $('.comment').hide();
        //   $('#modalMain').show();
        //   $('#btn-list').hide();
        //   $('.edit-btn').click(function(){
        //     var text = $('#messageInput').val();
        //     var time = moment().format('YYYY-MM-DD HH:mm');
        //     writeNewPost(text,itemKey,time);
        //     $('#messageInput').val('');
        //   });
        // });

        $('.delete-text').click(function(){//カードの削除とブロック
          if ($(this).children().text() == 'block') {//他人のコメントならば
            if (confirm("ブロックしても宜しいですか？")) {//ブロックの確認
              const block = $(this).parents(".timeline-card").data('key');
              $(this).parents(".timeline-card").addClass('hide');
              firebase.database().ref(`users/${user.uid}` + '/blocklist').push({
                block: block,
              });
            }
          } else {//自分のコメントならば
            if (confirm("削除しても宜しいですか？")) {//削除の確認
              var card = $(this).parents(".timeline-card");
                const itemKey = $(card).data('key');
                messagesRef.child(itemKey).remove();
            }
          }
        });
        /*表示*/
        messagesRef.orderByChild('time').on('child_added', function (snapshot) {//メッセージを追加（リアルタイム）
            var message    = snapshot.val();
            var messageKey = snapshot.key;//コメント自体のキー
            var formatDate = message.time;//投稿された時間
            var button1 = message.button1;//一つ目のボタンの情報
            var button2 = message.button2;//二つ目のボタンの情報
            const uid = message.uid;//コメントしたユーザーのID
            var taskcopy = createcard(message,messageKey,formatDate,user,uid,button1,button2);//カードの追加処理
            taskcopy.prependTo($('#messagesDiv'));
        });
        messagesRef.on('child_removed', function (snapshot) {//メッセージを削除（リアルタイム）
          var value = snapshot.val();
          // key取得
          var key = snapshot.key;
          // keyをもとにDOM検索
          var item = $(`[data-key=${key}]`)[0];
          item.remove();
        });

      }else{//ログインしているユーザーが居なければ
        location.href = 'index3.html';//ログイン画面に飛ばす
      }
    });
});
//ユーザの情報をusersに保存する
function writeUserData(userId, name, email, sex, iconImage) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    sex: sex,
    iconImage: iconImage,
  });
}
function sideIcon(user,icon) {//自分のアイコン表示
  if (icon !== '画像なし') {//自分の画像があるかどうか
    firebase.storage().ref(`/userIcon/${user.uid}/${icon}`).getDownloadURL().then((url) => {//自分の画像をダウンロード
      $('.side-user-icon').css('background-image','url(' + url + ')');//画像を表示
    });
  } else {//画像がなければ
    firebase.storage().ref('dummy.jpg').getDownloadURL().then((url) => {//自分の画像をダウンロード
      $('.side-user-icon').css('background-image','url(' + url + ')');//画像を表示
    });
  }
}
function writeButtonData1(itemKey,user) {//ボタン１を押したuserをデータに保存
  firebase.database().ref('/tasks/' + itemKey + `/button1-user/${user.uid}`).set({
    good: user.displayName,
  });
}
function writeButtonData2(itemKey,user) {//ボタン２を押したuserをデータに保存
  firebase.database().ref('/tasks/' + itemKey + `/button2-user/${user.uid}`).set({
    good: user.displayName,
  });
}
function writeButtonData(itemKey,user) {//どうでも良いねボタンを押したuserをデータに保存
  firebase.database().ref('/tasks/' + itemKey + `/users/${user.uid}`).set({
    good: user.displayName,
  });
}
// function writeNewPost(text,itemKey,time) {//編集処理（未実装）
//   // A post entry.
//   var postData = {
//     text: text,
//     time: time,
//   };
//   var updates = {};
//   updates[itemKey] = postData;
//   // updates['/user-posts/' + itemKey] = postData;
//   return messagesRef.update(updates);
// }
function createcard(message,messageKey,formatDate,user,uid,button1,button2) {//カードを作成
  var cloneTask = $('#cardDamy').find('div.timeline-card').clone(true);
  // console.log(cloneTask);
  cloneTask.attr('data-key',messageKey);
  cloneTask.attr('data-uid',uid);
  cloneTask.find('.original-btn1').prepend(`${button1}<span class="but1-gooduser"></span>`);//カウントの為Spanタグを追加
  cloneTask.find('.original-btn2').prepend(`${button2}<span class="but2-gooduser"></span>`);//カウントの為Spanタグを追加
/**
 * ボタンを表示するかの判定
 */
  if($.isEmptyObject(button1)&&$.isEmptyObject(button2)){
    cloneTask.find('.original-btn1').remove();
    cloneTask.find('.original-btn2').remove();
  }else if($.isEmptyObject(button2)){
    cloneTask.find('.original-btn2').remove();
  }
/**
 * 削除orブロックの判定
 */
  if (uid === user.uid) {
     cloneTask.find('.delete-icon').text('delete');//コメントが自分のものであればクラスを追加
   }
   firebase.database().ref(`users/${user.uid}` + '/blocklist').once('value', function(snapshot) {
     snapshot.forEach(function(childSnapshot) {//ブロックリストの数だけループ
       var childKey = childSnapshot.val().block;
       if (messageKey === childKey) {
         cloneTask.attr('class','hide');
       }
     });
   });
  var message1 = message.text.replace(/\r?\n/g, '<br>');//改行可能にする処理
  cloneTask.find('.textMain').html(message1);//メッセージを追加
  cloneTask.find('.timeline-user-id').text('@' + uid);//IDの表示
  /* コメントにアイコンと名前を表示する*/
  firebase.database().ref(`/users/${uid}`).once('value').then(function(snapshot) {
    var displayName = snapshot.val().username;//ユーザー名
    var flug = snapshot.val().iconImage;//ユーザーのアイコン情報
    cloneTask.find('.timeline-user-name').text(displayName);//名前の表示
    if(flug !== '画像なし'){//画像が設定してあればダウンロードして表示
      firebase.storage().ref(`/userIcon/${uid}/${flug}`).getDownloadURL().then((url) => {
        cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
      });
    }else{// 初期アイコンを全てにコメントに表示
      var imagesRef = firebase.storage().ref('dummy.jpg');
      imagesRef.getDownloadURL().then((url) => {
      cloneTask.find('.timeline-user-icon').css('background-image','url(' + url + ')');
      });
    }
  });

  firebase.database().ref('/tasks/' + messageKey + '/users').on('value', function (snapshot) {//ボタン
    var likecount    = snapshot.numChildren();//どうでも良いねが押された数を取得
    var opacitycount = 1.0 - likecount / 7;//opacityを変更（現在は1/7ずつ）
    cloneTask.find('.gooduser').text(likecount);//どうでも良いねが押された数を表示
    cloneTask.find('.card-body').css({
        opacity: opacitycount,
    });
  /**
   * どうでもいいねボタンのON・Off判定
   */
  firebase.database().ref('/tasks/' + messageKey + '/users/' + user.uid).once('value', function (snapshot) {//ボタン
      var likeuser = snapshot.numChildren();
      if (likeuser) {//ボタンを押したユーザーの中に自分がいるかを判定
        cloneTask.find('.like').addClass('changed');//居ればクラス追加
      } else {
        cloneTask.find('.like').removeClass('changed');//居なければ削除
      }
    });
  });
// =================================================================================
firebase.database().ref('/tasks/' + messageKey + '/button1-user').on('value', function (snapshot) {//ボタン
  var likecount    = snapshot.numChildren();//ボタンが押された数
  cloneTask.find('.but1-gooduser').text(likecount);
/**
 * ボタンのON・Off判定
 */
firebase.database().ref('/tasks/' + messageKey + '/button1-user/' + user.uid).once('value', function (snapshot) {//ボタン
    var likeuser = snapshot.numChildren();
    if (likeuser) {//ボタンを押したユーザーの中に自分がいるかを判定
      cloneTask.find('.original-btn1').addClass('changed');//居ればクラス追加
    } else {
      cloneTask.find('.original-btn1').removeClass('changed');//居なければ削除
    }
  });
});
// ===========================================================================================
firebase.database().ref('/tasks/' + messageKey + '/button2-user').on('value', function (snapshot) {//ボタン
  var likecount    = snapshot.numChildren();//どうでも良いねが押された数
  cloneTask.find('.but2-gooduser').text(likecount);
/**
 * ボタンのON・Off判定
 */
firebase.database().ref('/tasks/' + messageKey + '/button2-user/' + user.uid).once('value', function (snapshot) {//ボタン
    var likeuser = snapshot.numChildren();
    if (likeuser) {//ボタンを押したユーザーの中に自分がいるかを判定
      cloneTask.find('.original-btn2').addClass('changed');//居ればクラス追加
    } else {
      cloneTask.find('.original-btn2').removeClass('changed');//居なければ削除
    }
  });
});


  cloneTask.find('.now').text(formatDate);//入力された時間の表示

  return cloneTask;
}
/**
 * ログアウト処理
 */
function logout(){
    if(confirm("ログアウトしても宜しいですか？")){
      window.localStorage.removeItem('selectedUid');
      alert("ログアウトします");
      firebase.auth().signOut().catch(function(error) {
        console.log(error);
        console.log("ログアウトに失敗しました");
      });
    }else{
      alert("キャンセルしました");
    }
}

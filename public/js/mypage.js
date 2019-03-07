$(function(){

  $('.modal').modal();
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {//ユーザーがログインしていれば実行
      var userName = user.displayName;
      var uid = user.uid;
      var email = user.email;
      firebase.database().ref('users/' + uid).once('value', function (snapshot) {//ユーザー情報の判定
        var count = snapshot.numChildren();
        var snapshot = snapshot.val();
        var sex   = snapshot.sex;
        var text  = snapshot.text;
        var icon  = snapshot.iconImage;
        $('#textarea1').val(text);
          $('#' + sex).prop("checked", true);
          userdata(user,icon,uid);
          if (count = 0) {//初ログインの人のみ登録
            var sex = 'other';
            var iconImage = '画像なし';
            writeUserData(uid,userName,email,sex,iconImage);//ユーザーの情報を登録
          }
        });
        console.log(user);
        $('.sidenav').sidenav();
        $('#text1,#textarea1').characterCounter();
        $('.side-user-name').text(userName);//サイドバーのユーザー名
        $('.name').val(userName);//設定画面のユーザー名
        $('#email').val(email);//設定画面のemail
        $('.savebtn').click(function(){//プロフィールの保存
          var email = $('#email').val();
          if(email != user.email){
              // メールアドレスが変わっている
              var instance = M.Modal.getInstance($('.modal'));
              instance.open();
              return false;
          }
          console.log("通化 ---------------------");
          
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
              }).then(function() {
                if ($("#upfile")[0].files[0]) {
                  var image = $("#upfile")[0].files[0];
                  var fileName = image.name;//file名
                  console.log(image);
                  var upImageRef = firebase.storage().ref(`/userIcon/${uid}`).child(fileName);
                  upImageRef.put(image).then(function(snapshot) {
                    console.log('Uploaded a blob or file!');
                    firebase.database().ref(`/users/${uid}`).update({iconImage:fileName}).then(function() {
                      window.localStorage.setItem('selectedUsers', myName);
                      location.reload();
                    });//ユーザにアイコン名を保存
                  });
                } else {
                  location.reload();
                }
              });
            }).catch(function(error) {
              // An error happened.
              console.log(error);
              alert('エラーが発生しました');
          });
        });

        /*
         *アイコン画面の変更
         */
         $('#upfile').on('change', function (e) {
              var reader = new FileReader();
              reader.onload = function (e) {
                  $("#file-preview").css('background-image','url(' + e.target.result + ')')
              }
              reader.readAsDataURL(e.target.files[0]);
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
  });
}

function userdata(user,icon) {
  var selectedUid = window.localStorage.getItem('selectedUid');
  console.log(icon);
  if (icon !== '画像なし') {//自分の画像があるかどうか
    firebase.storage().ref(`/userIcon/${user.uid}/${icon}`).getDownloadURL().then((url) => {//自分の画像をダウンロード
      $('.side-user-icon').css('background-image','url(' + url + ')');//画像を表示
    });
  } else {//画像がなければ
    $('.side-user-icon').css('background-image','url(' + url + ')');//画像未設定の場合の画像を表示
  }
  if (selectedUid !== user.uid) {//自分以外のユーザーだったら
    $('.myName').addClass('hide');//編集可能なエリアを非表示
    $('#textarea1').parent().parent().remove();//編集可能なエリアを削除
    $('.otherName').removeClass('hide');//編集不可能なエリアを表示
    firebase.database().ref('users/' + selectedUid).on('value', function (snapshot) {//ユーザー情報の判定
      var snapshot = snapshot.val();
      var name = snapshot.username;//ユーザー名
      var sex  = snapshot.sex;//ユーザーの性別
      var text = snapshot.text;//自己紹介文
      var icon = snapshot.iconImage;//ユーザーのアイコン
      $('.name').val(name);//名前を表示
      $('#textarea2').text(text);//編集不可能なエリアにテキストを表示
      $('#' + sex).prop("checked", true);//性別を表示
      $("input[name=group1]:not(:checked)").parents(".input-type-radio").hide();//チェックされている部分以外を非表示
      showIcon(selectedUid,icon);//アイコン表示関数発火
      });
  } else {//自分だったら
    $('.name').val(user.displayName);//名前を表示
    $('.userEmail').removeClass('hide');//メールアドレスを表示
    showIcon(selectedUid,icon);//アイコン表示関数発火
  }
}

function showIcon(selectedUid,icon) {//アイコン表示関数
  /* アイコン表示 */
    if(icon !== '画像なし'){//画像があれば
      firebase.storage().ref(`/userIcon/${selectedUid}/${icon}`).getDownloadURL().then((url) => {//ユーザーのアイコンをダウンロード
        $('.mypage-user-icon').css('background-image','url(' + url + ')');//ユーザーのアイコンを表示
      });
    }else{//画像がなければ
      var imagesRef = firebase.storage().ref('dummy.jpg');//画像が設定されていない場合のリンク
      imagesRef.getDownloadURL().then((url) => {//画像をダウンロード
       $('.mypage-user-icon').css('background-image','url(' + url + ')');//画像を表示
      });
    }
}

/*
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

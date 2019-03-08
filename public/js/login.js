$(function() {
  $('#name').characterCounter();//文字数カウントの処理
  $('#signUp').click(function() {
    if ($('#name').val().length <= 12 && $('#name').val()) {
      signUp();
    }else{
      message('nameError');
    }
  });
  $('#signIn').click(function() {
    signIn();
  });
});
function signUp() {//新規登録の処理
    var name = $('#name').val();
    var email = $('#email').val();
    var password = $('#password').val();
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(result) {
        console.log(result);
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            user.updateProfile({
              displayName: name,
            }).then(function() {
              var name = user.displayName;
              var uid = user.uid;
              var email = user.email;
              var sex = 'other';
              var iconImage = '画像なし';
              firebase.database().ref('users/' + uid).set({
                username: name,
                email: email,
                sex: sex,
                iconImage: iconImage,
              }).then(function() {
                window.location.href = "index.html";
              });
            });
          } else {
            console.log(error)
            var error = error.code;
            message(error);
          }
        });
      }).catch(function(error) {
        console.log(error)
        var error = error.code;
        message(error);
      });
  }

function signIn() {//ログインの処理
    var email = $('#email').val();
    var password = $('#password').val();
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function() {
      window.location.href = "index.html";
    }).catch(function(error) {
      console.log(error);
      $('#errorMessage').text('メールアドレスかパスワードが間違っています');
    });
}

function message(error) {
  switch (error) {
    case 'auth/invalid-email':
      $('#errorMessage').text('不正なメールアドレスです');
      break;
    case 'auth/weak-password':
      $('#errorMessage').text('不正なパスワードです');
      break;
    case 'auth/email-already-in-use':
      $('#errorMessage').text('既に使用されているメールアドレスです');
      break;
    case 'nameError':
      $('#errorMessage').text('その名前は設定出来ません');
      break;
    default:
      $('#errorMessage').text('予期せぬエラーが発生しました');
      break;
  }
}

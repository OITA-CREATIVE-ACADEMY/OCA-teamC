$(function(){
    $('#agree_btn').on('click', function(e){
        console.log('savebtn -------------');
        // ログインしているユーザを取得する
        firebase.auth().onAuthStateChanged(function(user) {
            if (!user) {
                location.href = 'index3.html';
            } else {
              var myName = $('.name').val();
              if (myName.length <= 12 && myName) {
                  // サインイン済み
                  console.log("ログインしている");
                  // パスとメールアドレスの取得
                  var pass_input = $('#pass_input').val();
                  var email = $('#email').val();
                  //あとで使う
                  firebase.auth()
                  .signInWithEmailAndPassword(user.email, pass_input)
                  .then(function(userCredential) {
                      // メールの更新
                      userCredential.user.updateEmail(email);
                      // それ以外の更新
                      var radiobtn = $('input[name=group1]:checked').val();
                      var textarea = $('#textarea1').val();
                      console.log(user);
                      user.updateProfile({
                        displayName: myName,
                        }).then(function() {
                          // Update successful.
                          firebase.database().ref('users/' + user.uid).update({
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
                          $('#errorMessage').text('エラーが発生しました');
                      });
                  }).catch(function(error) {
                    // An error happened.
                    $('#errorMessage').text('メールアドレスかパスワードが間違っています');
                });
              }
            }
        });
    });

  function setAlert(){
    alert("このアラートを表示させた後に、モーダルウィンドウを表示させないようにしたい。");
    return;
  }
});

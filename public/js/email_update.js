$(function(){
    $('.savebtn').on('click', function(){
    
    // ログインしているユーザを取得する
    firebase.auth().onAuthStateChanged(function(user) {

        if (!user) {
            // サインインしていない状態
            // サインイン画面に遷移する等
            // 例:
            console.log("ログインしていない");
            
          } else {
            // サインイン済み
            console.log("ログインしている");

            // パスとメールアドレスの取得
            var pass1 = $('#pass1').val();
            var mail2 = $('#mail2').val();
            console.log(pass1);
            console.log(mail2);
            

            firebase.auth()
            .signInWithEmailAndPassword(user.email, pass1)
            .then(function(userCredential) {
                userCredential.user.updateEmail(mail2)
            })

            // user.updateEmail("user@example.com").then(function() {
            //     // Update successful.
            // }).catch(function(error) {
            //     // An error happened.
            // });
          }

        $('#email').text();
        console.log($('#email').text());

        // user.updateEmail("user@example.com").then(function() {
        //     // Update successful.
        //   }).catch(function(error) {
        //     // An error happened.
        //   });

        // リスト6：メールアドレス変更テンプレート
        // ref.changeEmail({                            //（1）
        //   oldEmail : user.email,
        //   newEmail : "bobtony@google.com",
        //   password : "correcthorsebatterystaple"
        // }, function(error) {
        //   if (error === null) {
        //     console.log("Email changed successfully");
        //   } else {
        //     console.log("Error changing email:", error);
        //   }
        // });

        // リスト7：メールアドレスの変更処理（email-ce.html）
        // $('#mailChgExe').click(function(e){  
        //     ref.changeEmail({
        //         newEmail : $('#mail2').val(),       //（2）
        //         password : $('#pass1').val()        //（3）
        //     }, function(error) {
        //         if (error === null) {
        //         $('#stat').text('メールアドレス変更　成功');
        //             console.log("Email changed successfully");
        //         } else {
        //         $('#stat').text('メールアドレス変更　不成功');
        //                 console.log("Error changing email:", error);
        //         }
        //    });
        // });
        });
        
        
        
            alert('aaaaaa');
        });
});
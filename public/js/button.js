$(function(){
  firebase.auth().onAuthStateChanged(function(user) {
    var uid = user.uid;
    var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
    $('#modal-switch-list').click(function(){
      $('#modalMain').hide();
      $('#btn-list').show();
    });
    $('#modal-switch-main').click(function(){
      $('#modalMain').show();
      $('#btn-list').hide();
      var l = $('.add-button');
      console.log(l);
      $.each(l,
        function(index){
          console.log(l.eq(index).text());
          var addText = $('.decide-button').eq(index).text();
          l.eq(index).text(addText);
          console.log(l.eq(index));
          switch ($('.decide-button').length) {
            case 1:
            l.show();
            l.eq(1).hide();
            break;
            case 2:
            l.show();
            break;
            default:
            l.hide();
            break;
          }
      });
    });
    $('.button-color').on('click', function() {
      if($(this).hasClass('decide-button')){
        $(this).css('background-color','#ffffff');
        $(this).removeClass('decide-button');
      }else{
        var cnt = $('.decide-button').length;
        console.log(cnt);
        if(cnt < 2){
          $(this).addClass('decide-button').attr('style','background-color:#26a69a');
        }
      }
    });
    $('.comment').click(function(){//コメントをfirebaseに保存
      var text = $('#messageInput').val();
      if (text.length <= 250 && text) {
        var time = moment().format('YYYY-MM-DD HH:mm');
        // var uid  = user.uid;
        const addText1 = $('.decide-button').eq(0).text();
        const addText2 = $('.decide-button').eq(1).text();
        messagesRef.push({text:text,time:time,uid:uid,button1:addText1,button2:addText2});
        $('#messageInput').val('');
        $('.modal-close').click();
      }
    });
  });
});
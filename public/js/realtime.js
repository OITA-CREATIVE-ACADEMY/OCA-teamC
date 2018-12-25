$(function () {
  var messagesRef = firebase.database().ref('/tasks/');//モーダルを使う為の記述
  messagesRef.on('value', function(snapshot) {
    var value = snapshot.val();
    console.log(value);
    console.log(Object.keys(value));
    $('.child_item').remove();

    for (let key in value) {
      var item = value[key];
      var elem = `<p class="child_item">${item.text}</p>`
      $('#posts').append(elem);
    }
  });
});

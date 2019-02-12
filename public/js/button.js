$(function(){
  $('#modal-switch-list').click(function(){
    $('#modalMain').hide();
    $('#btn-list').show();
  });

  $('#modal-switch-main').click(function(){
    $('#modalMain').show();
    $('#btn-list').hide();
  });
})
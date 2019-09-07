function openModal(content, duration=200){
    if ($('body').find('.modalRoot').length!=0){
        return;
    }
    $(`
        <div class="modalRoot" onclick="modalClick(event)" onkeyup="modalKey(event)"></div>
    `).hide().appendTo('body').fadeIn(duration);

    $(`
        <div class="modalWindow">${content}</div>
    `).hide().appendTo('.modalRoot').show(duration);
}

function closeModal(duration=100){
    $('.modalRoot').fadeOut(duration, function(){$(this).remove()});
}

function modalKey(e){
    //console.log('key');
}

function modalClick(e){
    if (e.target!=$('.modalWindow')[0] && $('.modalWindow').find(e.target).length==0)
        closeModal();
} 
const errorCss = {
    color: "#721c24",
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb"
},
successCss = {
    color: "#155724",
    backgroundColor: "#d4edda",
    borderColor: "#c3e6cb"
},
warningCss = {
    color: "#856404",
    backgroundColor: "#fff3cd",
    borderColor: "#ffeeba"
}

function destroyInfoBox(){
    $(this).fadeOut(200, ()=>{$(this).remove()});
}

function drawBox(message, css={}){
    if (css==="error"){
        css = errorCss;
    }
    if (css==="success"){
        css = successCss;
    }
    if (css==="warning"){
        css = warningCss;
    }
    const elem = $(`
    <div class="infoBox">
        <div class="infoBoxCloseButton" onclick="destroyInfoBox.call($(this).parent())">x</div>
        <div class="infoBoxText">${message}</div>    
    </div>
    `)
    .css(css)
    .hide()
    .appendTo('body')
    .fadeIn(200);

    setTimeout(()=>destroyInfoBox.call(elem), Math.max(3000, 100*message.length));
}
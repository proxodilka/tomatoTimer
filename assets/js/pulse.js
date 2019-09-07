function stopPulseAnimation(){
    $(this).removeClass("pulseAnimation");
    $(this).css({
        borderColor: "transparent"
    })
}

function startPulseAnimation(from, to){
    $(this).addClass("pulseAnimation");
    pulseAnimation.call(this, from, to);
}

function pulseAnimation(from, to){
    if (!$(this).hasClass("pulseAnimation"))
        return;
    setTimeout(()=>{
        if (!$(this).hasClass("pulseAnimation"))
            return;
        $(this).css({
            borderColor: `${from}`
        });
        setTimeout(()=>{
            if (!$(this).hasClass("pulseAnimation"))
                return;
            $(this).css({
                borderColor: `${to}`
            });
            pulseAnimation.call(this, from, to);
        }, 1500)
    }, 1500);
}
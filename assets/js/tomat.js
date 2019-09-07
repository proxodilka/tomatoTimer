var hintText="";

function blockElements(){
    $('.modalFields').attr("disabled","true");
    $('#setDefaults').attr("disabled","true");
}

function unblockElements(){
    $('.modalFields').removeAttr("disabled");
    $('#setDefaults').removeAttr("disabled");
}

function askForClose(){
    if (!onTask){
        drawBox("Для запуска таймера наведите на задачу и кликните по томату");
        return;
    }
    openModal(`
        <div class="modalHeader">Завершить задачу досрочно?</div>
        <div class="modalButton">
            <button class="closeModal" onclick="closeModal()">Нет</button>
            <button class="closeModal" onclick="endTomat(); closeModal();">Да</button>
        </div>
    `);
}

function formalTomatStart(main){
    $('.pause').find('img').attr('src','assets/img/pause.png');
    $(main).css({
        borderColor: "#ff000026"
    })
    $(main).addClass("activeTomatTask");
    startPulseAnimation.call(main, "#ff000000", "#ff000026");
    hintText = $(main).find('.taskField').text().substr(0, 32);

    onTask=true;

    timerId = setInterval(tomatHandler, 100);
}

function startTomat(){
    const main = $(this).parents('.newTaskRoot')[0];
    if ($(main).hasClass('done')){
        return;
    }

    if (onTask && !$(main).hasClass("activeTomatTask")){
        drawBox("Какое-то задание уже запущено, завершите сначала его.","error");
        return;
    }
    if ($(main).hasClass("activeTomatTask")){
        askForClose();
        return;
    }
    
    formalTomatStart(main);

    let id = $(main).data('id');
    TASKS[id].tomato++;
    updateStorage();

    $(main).find('.tomatoAmount').text(TASKS[id].tomato);
    $(main).find('.tomatCounter').attr("title", `Томатов потрачено: ${TASKS[id].tomato}`);
    startTime = Date.now();
    localStorage.setItem("_tomato-app:tomatoTimer", JSON.stringify({
        startTime: startTime,
        taskId: $(main).data("id")
    }));

    drawBox(`Таймер запущен`, "success");
}

function tomatHandler(){
    let currentTime = Date.now();
    let timeLeft = (startTime+userSettings.timerLength)-currentTime;

    setProgress(100-((timeLeft)/userSettings.timerLength)*100);

    let hh = Math.floor(timeLeft/(1000*60*60));
    let mm = Math.floor(timeLeft/(1000*60))%60;
    let ss = Math.floor(timeLeft/(1000))%60;

    if (hh<10){
        hh="0"+hh;
    }
    if (mm<10){
        mm="0"+mm;
    }
    if (ss<10){
        ss="0"+ss;
    }

    if (startTime+userSettings.timerLength<=currentTime){
        endTomat();
        return;
    }

    $('.timeLeft').text(`${hh}:${mm}:${ss}`);
    $('head title').text(`${hh}:${mm}:${ss} ${hintText}`);

}

function endTomat(reason="timeLeft", noModal=false){
    if (!onTask)
        return;
    let header;
    
    localStorage.removeItem('_tomato-app:tomatoTimer');
    clearInterval(timerId);
    onTask=false;
    
    unblockElements();

    $('.pause').find('img').attr('src','assets/img/play.png');
    setProgress(0);
    updateTimerLength();
    $('.undoneTasksRoot > .newTaskRoot').each(function(){
        if ($(this).hasClass("activeTomatTask")){
            $(this).removeClass("activeTomatTask");
            stopPulseAnimation.call(this);
        }
    })

    if (!noModal){
        if (reason=="timeLeft")
            header="Время вышло!";
        if (reason=="done")
            header="Круто, задача выполнена!";
        openModal(`
            <div class="imgRoot">
                <img src="assets/img/tomatEnd.png" alt="">
            </div>
            <div class="modalHeader">
                ${header}
            </div>
            <div class="modalText">
                Ты продуктивно провёл эти несколько минут, однохни немного и снова за работу!
            </div>  
            <div class="modalButton">
                <button class="closeModal" onclick="closeModal();">Ок</button>
            </div>
        `);
    }
    
    clearTitle();
        
}
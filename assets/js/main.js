var TASKS = {};
var onTask=false;
var defaultLength = 1000*60*5;
const userSettings = {
    timerLength: defaultLength
}
var startTime=0;
var timerId;
var isEditorOpen=0;
var openedFields = [];
var tutorialText = `
Привет! Давай я расскажу тебе как тут всё устроено.<br>Это приложение - список задач с помидоро-таймером, 
добавить новую задачу можно сверху, а выполненные будут появлятся внизу.<br><br>Ты можешь запустить
 помидоро-таймер для одной из задач:<br>просто наведи на одну из них и кликни по помидору, прервать можно в любой
  момент, по умолчанию он заводится на 5 минут, но ты всегда можешь изменить его продолжительность в настройках.<br><br>
  Твоя первая задача — пометить это задание как выполненное, справишься?
`;

function getField(x){
    return $(x).parent().parent().find('.taskField')[0];
}

function clearTask(){
    $(getField(this)).html("");
    trackFieldHeight.call(getField(this));
}

function clearTasks(option){
    $('.doneTasksRoot .newTaskRoot').remove();
    if (option=="done")
        for(let x in TASKS){
            if (TASKS[x].done)
                delete TASKS[x];
        }

    if (option!="done"){
        $('.undoneTasksRoot .newTaskRoot').remove();
        TASKS = {};
    }
        
    updateStorage();
    drawBox("Список задач успешно очищен","success");
}

function addTask(event, outerClick=0){
    let data = getField(this).innerHTML;
    if (data==""){
        if (!outerClick)
            drawBox("Нельзя создать пустую задачу","error");
        return;
    }
    let newId = Date.now();
    TASKS[newId] = {
        data: data,
        done: false,
        tomato: 0
    };
    updateStorage();
    clearTask.call(this);
    insertNewTask(newId);
}

function insertFake(){
    
}

function addEllipsis(){
    const elem = this;
    const x = $(elem).find('.taskField')[0];
    $(elem).find('.ellipsis').css({
        background: `linear-gradient(to right, rgba(255, 255, 255, 0), ${$(elem).css("background-color")} 40%)`
    })
    if (x.clientHeight<x.scrollHeight-5){
        $(elem).find('.ellipsis').show();
    }
    else{
        $(elem).find('.ellipsis').hide();
    }
    return elem;
}

function getJqTask(i){
    return $(`
    <div class="newTaskRoot pointer undone" data-id="${i}">
        <div spellcheck="false" contenteditable="true" class="taskField undoneArea" placeholder="Введите задачу...">${TASKS[i].data}</div>
        <div class="ellipsis" style="display: none">...</div>
        <div class="textareaFooter" style="display: none">
            <button class="saveTask">Сохранить</button>
            <button class="clearTask">Очистить</button>
        </div>
        <div class="extraInfo" style="display:none">
            <img src="assets/img/bin.svg" class="delete" alt="">
            <img src="assets/img/done.svg" class="markDone" alt="">
            <div class="tomatCounter" title="Томатов потрачено: ${TASKS[i].tomato}">
                <img src="assets/img/tomat.png" class="tomat" alt="">
                <span class="tomatoAmount">${TASKS[i].tomato}</span>
            </div>
        </div>
    </div>
`); 
}

function getJqTaskDone(i){
    return $(`
    <div class="newTaskRoot pointer done" data-id="${i}">
        <div spellcheck="false" class="taskField undoneArea" placeholder="Введите задачу..." style="overflow-wrap: break-word;">${TASKS[i].data}</div>
        <div class="ellipsis" style="display: none">...</div>
        <div class="textareaFooter" style="display: none">
        </div>
        <div class="extraInfo" style="display:none">
            <img src="assets/img/bin.svg" class="delete" alt="">
            <div class="tomatCounter" title="Томатов потрачено: ${TASKS[i].tomato}">
                <img src="assets/img/tomat.png" alt="">
                <span class="tomatoAmount">${TASKS[i].tomato}</span>
            </div>
        </div>
    </div>
    `)
}

function drawTasks(){
    for(let x in TASKS){
        if (!TASKS[x].done)
            getJqTask(x).hide().prependTo($('.undoneTasksRoot')).show(100, addEllipsis);
        else
            getJqTaskDone(x).hide().prependTo($('.doneTasksRoot')).show(100, addEllipsis);
    }
}

function insertNewTask(id){
    getJqTask(id).hide().prependTo($('.undoneTasksRoot')).show(100, addEllipsis);
}

function insertNewDoneTask(id){
    getJqTaskDone(id).hide().prependTo($('.doneTasksRoot')).show(100, addEllipsis);
}

function markTaskAsDone(){
    const main = $(this).parents('.newTaskRoot')[0];
    if ($(main).hasClass('activeTomatTask'))
        endTomat("done");

    $(main).find('.ellipsis').hide();
    let id = $(main).data('id');
    TASKS[id].done=true;
    updateStorage();

    $(main).css("transition-duration", "0.2s");
    $(main).css("background-color", "#4caf50");
    
    $(main).hide(700, function(){$(this).remove()});

    insertNewDoneTask(id);
}

function deleteTask(){
    const main = $(this).parents('.newTaskRoot')[0];
    if ($(main).hasClass('activeTomatTask')){
        drawBox("Нельзя удалить активную задачу","error");
        return;
    }
    let id = $(main).data('id');
    delete TASKS[id];
    //TASKS.splice($(main).data('id'),1);
    updateStorage();

    $(main).hide(200, function(){$(this).remove()});
}

function showExtras(duration=200){
    if ($(this).hasClass('activeField'))
        return;
    $(this).find('.extraInfo').fadeIn(duration);
}

function hideExtras(duration=200){
    if ($(this).hasClass("activeField"))
        return;
    $(this).find('.extraInfo').fadeOut(duration);
}

function trackFieldHeight(){
    console.log('tracking');
    if (this.clientHeight>=parseInt($(this).css("max-height"))){
        if ($(this).css("overflow-y")!="scroll");
            $(this).css("overflow-y","scroll");
    }
    else{
        if ($(this).css("overflow-y")!="hidden");
            $(this).css("overflow-y","hidden");
    }
}

function openEditor(e){
    if (e.target.nodeName.toLowerCase() == "button"
        || e.target.nodeName.toLowerCase() == "img" 
        || $(this).hasClass('activeField') 
        || $(e.target).parents('.extraInfo').length!=0)
        return;
    console.log('openEditor');
    tryhideInfo();
    isEditorOpen++;
    //console.log(isEditorOpen);
    $(this).find('.ellipsis').hide();
    let field = $(this).find('.taskField')[0];
    $(field).css("height","auto");
    $(field).on('input change', trackFieldHeight);
    trackFieldHeight.call(field);

    $(this).addClass('activeField');

    $(this).find('.textareaFooter').fadeIn(300);
    const inf = $(this).find('.extraInfo').stop(true, true);
    $(inf).remove().css({
        display: "flex",
        position: "relative",
        oppacity: "1",
        right:"0",
        bottom:"0"
    });

    $(this).find('.textareaFooter').append(inf);
    
}

function closeEditor(){
    //console.log('closeEditor');
    isEditorOpen--;
    //console.log(isEditorOpen);
    let field = $(this).find('.taskField')[0];
    $(field).css("height",$(field).css("min-height"));
    $(field).css("overflow-y","hidden");
    $(field).scrollTop(0);
    // stop(field);
    $(this).removeClass('activeField');

    const inf = $(this).
    find('.extraInfo').
    remove().
    css({
        position: "absolute",
        right:"3px",
        bottom:"3px",
        oppacity: "0"
    }).
    appendTo(this).
    hide();

    $(this).append(inf);

    $(this).find('.textareaFooter').hide();
    if (isEditorOpen==0){
        showInfo();
    }

    addEllipsis.call(this);
}

function saveTask(){
    //console.log('saveTask');
    const main = $(this).parent().parent();

    if (!$(main).hasClass('done')){
        let id = $(main).data('id');
        TASKS[id].data=$(main).find('.taskField').html();
        if (TASKS[id].data==""){
            deleteTask.call(this);
            return;
        }

        updateStorage();
    }

    closeEditor.call(main);
}

function updateStorage(){
    localStorage.setItem('_tomato-app:tasks', JSON.stringify(TASKS));
}

function getTasksFromLocalStorage(){
    TASKS = JSON.parse(localStorage.getItem('_tomato-app:tasks'));
    if (TASKS === null){
        TASKS = {};
        TASKS[Date.now()] = {
            data: tutorialText,
            done: 0,
            tomato: 0
        };

        updateStorage();
    }
        
}


function initTimer(){
    let timerInfo = JSON.parse(localStorage.getItem('_tomato-app:tomatoTimer'));

    if (timerInfo===null)
        return;

    startTime = timerInfo.startTime;

    $('.undoneTasksRoot > .newTaskRoot').each(function(){
        if ($(this).data("id")==timerInfo.taskId){
            formalTomatStart(this);
        }
    })
}

function reInit(){
    
}

function redirect(){
    window.open(`${$(this).attr('href')}`, '_blank');
}

function setDefaultTime(){
    userSettings.timerLength = defaultLength;
    updateTimerLength();
}

function updateTimerLength(){
    const time = getPrettyTime(userSettings.timerLength);

    $('.timingfield_hours input').val(time.h).trigger('keyup');
    $('.timingfield_minutes input').val(time.m).trigger('keyup');
    $('.timingfield_seconds input').val(time.s).trigger('keyup');

    $('.timeLeft').text(`${time.h}:${time.m}:${time.s}`);
}

function openSettings(duration=200){
    openModal(`
            <div class="settingOption">
            <div class="modalHeader">Установить длительность таймера</div>
            <div class="modalFields">
                <input type="text" class="timing" style="display: none;">
            </div>
            <div class="modalButtonRow">
                <button id="setDefaults" onclick="setDefaultTime()">По умолчанию</button>
            </div>
        </div>
        <div class="settingOption">
            <div class="modalButtonRow">
                <button class="closeModal" onclick="clearTasks('done')">Удалить выполненные задания</button>
                <button class="closeModal" onclick="closeModal(0); setTimeout(()=>openClearApp(0), 0);">Сбросить приложение</button>
            </div>
        </div>
        <div class="settingOption">
            <div class="modalButtonRow">
                <button class="closeModal" onclick="closeModal()">Закрыть</button>
            </div>
        </div>
    `,duration);
    $(".timing").timingfield();
    if (onTask)
        blockElements();

    updateTimerLength();
}

function tryhideInfo(){
    if ($(window).width()<=1200){
        hideInfo();
    }
}

function hideInfo(){
    //isEditorOpen++;
    $('.timerRoot').fadeOut(100);
    $('.settingsButton').fadeOut(100);
}

function showInfo(){
    //isEditorOpen--;
    $('.timerRoot').fadeIn(100);
    $('.settingsButton').fadeIn(100);
}

function getPrettyTime(milisec){
    let h = Math.floor(milisec/(1000*60*60)),
    m = Math.floor(milisec/(1000*60))%60,
    s = Math.floor(milisec/(1000))%60;
    
    if (h<10){
        h="0"+h;
    }
    if (m<10){
        m="0"+m;
    }
    if(s<10){
        s="0"+s;
    }

    return {
        h:h,
        m:m,
        s:s
    }
}

function updateLength(){
    userSettings.timerLength = parseInt($(this).val())*1000;
    localStorage.setItem("_tomato-app:settings", JSON.stringify(userSettings));

    const time = getPrettyTime(userSettings.timerLength);

    $('.timeLeft').text(`${time.h}:${time.m}:${time.s}`);
}

function getSettings(){
    const settingsFromStorage = JSON.parse(localStorage.getItem("_tomato-app:settings"));
    if (settingsFromStorage!=null){
        Object.assign(userSettings, settingsFromStorage);
    }   
    else{
        localStorage.setItem("_tomato-app:settings", JSON.stringify(userSettings));
    }
}

function clickListener(e){
    ((x)=>{
        let e  = x;
        if ($(e.target).hasClass('newTaskRoot') || $(e.target).parents('.newTaskRoot').length!=0){
            let elem = $(e.target).hasClass('newTaskRoot')?e.target:$(e.target).parents('.newTaskRoot')[0];
            
            if ($(e.target).parents('.extraInfo').length!=0){
                if (($(e.target).hasClass('tomatCounter') || $(e.target).parents('.tomatCounter').length!=0) && elem==openedFields[0]){
                    return;
                }
                else if (openedFields.length!=0 && elem!=openedFields[0]){
                    if($(openedFields).find('#newTaskField').length!=0){
                
                    }
                    else{
                        saveTask.call($(openedFields[0]).find('.extraInfo'));
                    }
                }
                openedFields = [];
                return;
            }
    
            if (openedFields.length==0){
                openedFields.push(elem);
                return;
            }
    
            if (elem==openedFields[0]){
                if ($(e.target).hasClass('saveTask')){
                    openedFields=[];
                }
                return;
            }
            
            if($(openedFields).find('#newTaskField').length!=0){
                
            }
            else{
                saveTask.call($(openedFields[0]).find('.extraInfo'));
            }
            openedFields[0] = elem;
        }
        else{
            if (openedFields.length==0){
                return;
            } 
            if($(openedFields).find('#newTaskField').length!=0){
                addTask.call($(openedFields[0]).find('.addTask'), e, 1);
            }
            else{
                saveTask.call($(openedFields[0]).find('.extraInfo'));
            }
            openedFields = [];
        }
    })(e);
    console.log(openedFields);
    if (openedFields.length==0){
        showInfo();
    }
    else{
        tryhideInfo();
    }
}

function clearTitle(){
    $('head title').text("Нет активных задач");
}

function openClearApp(duration=100){
    openModal(`
        <div class="modalHeader">Точно хотите сбросить приложение? Все данные будут удалены</div>
        <div class="modalButtonRow">
            <button class="closeModal" onclick = "closeModal(0); setTimeout(()=>openSettings(0),0)">Нет</button>
            <button class="closeModal" onclick = "resetApp()">Да</button>
        </div>
    `, duration);
}

function resetApp(){
    localStorage.removeItem('_tomato-app:tomatoTimer');
    localStorage.removeItem('_tomato-app:settings');
    localStorage.removeItem('_tomato-app:tasks');
    
    location.reload();
}

$(function(){
    getTasksFromLocalStorage();
    drawTasks();
    getSettings();
    initTimer();
    initCircle();
    updateTimerLength();



    const root = $('.main');

    $(document).on('click touch', clickListener);

    $(root).on('click', 'a', redirect);
    $('body').on('click','.timerRoot', askForClose);
    $('body').on('input','.timing', updateLength);
    $('.settingsButton').on('click', openSettings);


    window.onresize = ()=>{$('.newTaskRoot').each(function(){addEllipsis.call(this)})}
    

    $(root).on('click','.addTask', addTask);
    $(root).on('click','.clearTask', clearTask);
    $(root).on('click','.saveTask', saveTask);
    $(root).on('click','.delete', deleteTask);
    $(root).on('click','.markDone', markTaskAsDone);
    $(root).on('click','.tomatCounter', startTomat)

    $(root).on('mouseenter','.newTaskRoot', showExtras);
    $(root).on('mouseleave','.newTaskRoot', hideExtras);
    $(root).on('click','.newTaskRoot', openEditor);

    

});

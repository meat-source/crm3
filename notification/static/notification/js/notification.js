const ws_url_notification = 'ws://' + window.location.host + '/ws/notification/'
var socket;
var connected = false;
var callAudio = new Audio();
var msgAudio = new Audio();
var opensUserChat = ''
var countChatMessage = 0

typeof WebSocket !== 'undefined' && function connect() {
    socket = new WebSocket(ws_url_notification);
    socket.onmessage = onMessage;
    socket.onopen = onOpen;
    socket.onerror = err => {
        if (document.getElementById('msg-notification') == null && connected == false){
            createNotificationDOM('нет соединения с сервером','danger',false)
        }
        console.error(err);
        socket.onclose = null;
        connected = false;
        socket.close();
        connect();
    };
    socket.onclose = event => {
        console.info(`WebSocket closed with code ${event.code}! ${event.reason}`);
        connected = false;
        if(event.wasClean) return;
        connect();
    };
}();
// При открытии сокета удаляем оповещение если было "нет соединения с сервером"
function onOpen(){
    connected = true;
    try{removeNotificationDOM()}
    catch(err){}
}

// Ф-ия принятия данных с сервера через сокет (Единая на ВСЕ!). Разделяет данные по typeof
// Оповещения выводит сверху. ждет пока не пройдет предыдущее (закроет юзер или автоматически закроется)
// Звонки выводит по центру оповещения чата сбоку. Сам чат работает через ajax.
function onMessage(event) {
    const data = JSON.parse(event.data);
    if(data.typeof == "call"){
        if(document.getElementById("call-notification") != null){
            answerNotification('call-no');
        }
        else{createCallDOM(data.message)}
    }
    if(data.typeof == "chat"){
    // Проверяем открыт ли чат переписки
        let chatArea = document.getElementById("chatArea")
        if(chatArea != null){
            if(opensUserChat == data.user_from_pk){
                // Добавляем в чат
                addMessageChatArea(data.user_from_pk,'',data.message)
                return 0
            }
        }
        createNotificationCHATDOM(data.user_from,data.user_from_pk,data.message)



    }
    // Ставим в ожидание если больше одного уведомления
    if(data.typeof == "notification"){
        function wait_create_notification() {
            if(document.getElementById("msg-notification") != null){
                console.log('ожидание очереди')
                timerId = setTimeout(wait_create_notification, 1000);
            }
            else{
                createNotificationDOM(data.message,data.status,data.auto_close)
                clearTimeout(timerId);
            }
        }
        var timerId = setTimeout(wait_create_notification,0)

    }
}

// Ответить серверу (послать на сервер)
function answerNotification(answer){
    socket.send(JSON.stringify({'message': answer}))

}

// Просто фун-ия спать. Останавливает весь поток!
function sleep(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){}
}

// Создает блок звонка
function createCallDOM(message){
    callAudio.src = staticRoot + 'audio/call.mp3'; // Указываем путь к звуку "клика"
    callAudio.play()
    let wrap = document.createElement('div')
    wrap.id = 'call-notification'
    let dialog = document.createElement('dialog')
    dialog.setAttribute('open','')
    let p = document.createElement('h4')
    p.innerHTML = message
    let hr = document.createElement('hr')
    let btnОk = document.createElement('button')
    btnОk.innerHTML = 'ответить'
    btnОk.setAttribute('onclick',"answerNotification('call-yes')")
    btnОk.classList.add('n-btn')
    btnОk.classList.add('n-btn-success')

    let btnNo = document.createElement('button')
    btnNo.classList.add('n-btn')
    btnNo.classList.add('n-btn-danger')
    btnNo.innerHTML = 'сбросить'
    btnNo.setAttribute('onclick',"answerNotification('call-no');removeCallDOM()")
    btnNo.style.float = 'right'

    wrap.appendChild(dialog)
    dialog.appendChild(p)
    dialog.appendChild(hr)
    dialog.appendChild(btnОk)
    dialog.appendChild(btnNo)
    document.body.appendChild(wrap)
}

// Удаляет блок звонка
function removeCallDOM(){
    let dialog = document.getElementById('call-notification')
    dialog.parentNode.removeChild(dialog);
    callAudio.pause();
}


// Создает уведомление сверху
function createNotificationDOM(message,status,auto_close){
    let div = document.createElement('div')
    div.id = 'msg-notification'
    div.classList.add('n-alert')
    div.classList.add('n-alert-' + status)
    if (auto_close === true){
        div.classList.add('n-alert-animation')
        setTimeout(removeNotificationDOM,4500)
    }
    let p = document.createElement('span')
    p.innerHTML = message
    let btnClose = document.createElement('a')
    btnClose.innerHTML = '✖'
    btnClose.classList.add('alert-cross')
    btnClose.setAttribute('onclick',"removeNotificationDOM()")
    div.appendChild(p)
    div.appendChild(btnClose)
    document.body.appendChild(div)
}

// Удаляет уведомление сверху
function removeNotificationDOM(){
    let div = document.getElementById('msg-notification')
    div.parentNode.removeChild(div);
}

// Создает уведомление чата (не сам чат)
// ЭТО НЕ ЧАТ ЭТО УВЕДОМЛЕНИЕ !!!!
function createNotificationCHATDOM(user_from,user_from_pk, message){
    msgAudio.src = staticRoot + 'audio/msg.mp3'; // Указываем путь к звуку "клика"
    msgAudio.play()
    let wrap = null;
    if(document.getElementById("wrapChatMessage") != null){
        wrap = document.getElementById("wrapChatMessage")
    }
    else{
        wrap = document.createElement('div')
    }
    wrap.id = 'wrapChatMessage'
    div = document.createElement('div')
    div.classList.add('notificationChat')
    div.classList.add('message-chat-animation')
    function removeAnimation(){div.classList.remove('message-chat-animation')}
    setTimeout(removeAnimation ,1000)
    div.title = 'нажми enter чтобы отправить'
    div.classList.add('chat-notification-animation')
    let nameUser = document.createElement('h3')
    nameUser.innerHTML = user_from
    let mess = document.createElement('p')
    mess.innerHTML = message
    mess.id = 'chat-notification-message'
    let btnClose = document.createElement('a')
    btnClose.innerHTML = '✖'
    btnClose.classList.add('alert-cross')
    btnClose.setAttribute('onclick',"removeNotificationCHATDOM(this.parentNode)")
    let textarea = document.createElement('input')
    let rand = Math.random().toString(36).substring(7);
    textarea.id = 'fast-answer-chat-' + rand.toString()


    let btnSubmit = document.createElement('button')
    let func = 'save_chat('+user_from_pk +',document.getElementById("' +  textarea.id + '").value);' +
                'removeNotificationCHATDOM(this.parentNode)'
    btnSubmit.setAttribute('onclick',func)
    btnSubmit.innerHTML = 'ответить'
    btnSubmit.classList.add('n-btn')
    btnSubmit.classList.add('n-btn-success')

    document.body.appendChild(wrap)
    wrap.appendChild(div)
    div.appendChild(nameUser)
    div.appendChild(mess)
    div.appendChild(btnClose)
    div.appendChild(textarea)
    div.appendChild(btnSubmit)

    textarea.addEventListener("keyup", function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            save_chat(user_from_pk,document.getElementById(textarea.id).value);
            let target = event.target || event.srcElement;
            removeNotificationCHATDOM(target.parentNode);
        }
    });
    countChatMessage += 1

}

// Удаляет оповещение чата
function removeNotificationCHATDOM(el){
    if (countChatMessage == 0){
        let wrap = document.getElementById('wrapChatMessage')
        wrap.parentNode.removeChild(wrap);
    }else{
        el.parentNode.removeChild(el);
        countChatMessage -= 1
    }

}


// Ajax взять всех пользователей django для чата (только авторизованным)
// Создать dom элемент с выбором
async function open_users_chat(){
    let div = document.createElement('div')
    div.id = 'users_chat'
    let btnClose = document.createElement('a')
    btnClose.innerHTML = '&#10094;'
    btnClose.classList.add('n-leftArrow')
    btnClose.setAttribute('onclick',"removeOpenUserChat()")
    div.appendChild(btnClose)
    let input = document.createElement('input')
    input.type = "text"
    input.id = 'inputFilterUser'
    input.setAttribute('onkeyup','filterUser()')
    input.placeholder="Поиск по имени.."
    let ul = document.createElement('ul')
    ul.id = 'listUser'
    document.body.appendChild(div)
    div.appendChild(input)
    div.appendChild(ul)

    let response = await fetch('get_users/');
    if (response.ok) { // если HTTP-статус в диапазоне 200-299
      // получаем тело ответа (см. про этот метод ниже)
      let json = await response.json();
          for(let i=0;i < json.length; i++){
            let li = document.createElement('li')
            li.setAttribute('onclick', 'createChatArea('+ json[i].id + ')')
            li.innerHTML = json[i].username
            if (json[i].id !== requestUserPk){
                ul.appendChild(li)
            }
          }

    } else {
      alert("Ошибка HTTP: " + response.status);
    }

}


function removeOpenUserChat(){
    try{
        removeChatArea()
        let users_chat = document.getElementById('users_chat')
        users_chat.parentNode.removeChild(users_chat);
    }
    catch(err){}
}

// Создать область чата
async function createChatArea(pk_user_to){
    removeChatArea()
    opensUserChat = pk_user_to
    let div = document.createElement('div')
    div.id = 'chatArea'
    let wrapInput = document.createElement('div')
    wrapInput.id = 'wrapChatTextArea'
    let textarea = document.createElement('textarea')
    textarea.id = 'chatTextArea'
    textarea.title = 'shift + enter чтобы отправить'
    btn = document.createElement('button')
    btn.innerHTML = 'Отправить'
    btn.classList.add("n-btn")
    btn.classList.add("n-btn-success")


    let btnClose = document.createElement('a')
    btnClose.innerHTML = '&#10094;'
    btnClose.classList.add('n-leftArrow')
    btnClose.setAttribute('onclick',"removeChatArea()")
    document.body.appendChild(div)
    document.body.appendChild(wrapInput)
    wrapInput.appendChild(btnClose)
    wrapInput.appendChild(btn)
    wrapInput.appendChild(textarea)






    btn.setAttribute('onclick',
        'let textarea = document.getElementById("chatTextArea").value;' +
        'save_chat(' + pk_user_to + ',textarea);' +
        'addMessageChatArea(' + requestUserPk+ ',"",textarea);' +
        'document.getElementById("chatTextArea").value = "";'
    )
    textarea.addEventListener("keyup", function(event) {
        if (event.keyCode == 13 && event.shiftKey) {
            save_chat(pk_user_to,textarea.value)
            addMessageChatArea(requestUserPk,'',textarea.value)
            textarea.value=""
        }
    });


    let response = await fetch('get_chat/' + requestUserPk + '/' + pk_user_to.toString());
    if (response.ok) { // если HTTP-статус в диапазоне 200-299
      // получаем тело ответа (см. про этот метод ниже)
      let json = await response.json();
          for(let i = json.length -1 ;i >= 0; i--){
            let user_from = json[i].fields.user_from // кто нам пишет
            let date_create = json[i].fields.date_create // дата
            let message = json[i].fields.message // сам текст сообщения
            console.log(json[i])
            addMessageChatArea(user_from,date_create,message)
          }
    }

}

// Добавляет сообщение в chatArea
function addMessageChatArea(user_from,date_create,message){
    div = document.getElementById('chatArea')
    let wrapP = document.createElement('div')
    let p = document.createElement('span')
    let small = document.createElement('h6')
    let date_mess = date_create.replace('T',' ').replaceAll('-','.')
    sliceTime = date_mess.lastIndexOf(':')
    small.innerHTML = date_mess.substring(sliceTime,0)

    p.innerHTML = message
    if(user_from == requestUserPk){
        wrapP.style.textAlign = 'right';
        p.style.background = 'WhiteSmoke'
    }
    wrapP.appendChild(small)
    wrapP.appendChild(p)
    div.append(wrapP)
    // скролл вниз
    chatArea.scrollTop = chatArea.scrollHeight
}


function removeChatArea(){
    try{
        let chatArea = document.getElementById('chatArea')
        chatArea.parentNode.removeChild(chatArea);
        let wrapChatTextArea = document.getElementById('wrapChatTextArea')
        wrapChatTextArea.parentNode.removeChild(wrapChatTextArea);
        opensUserChat = ''
    }
    catch(err){}
}




// Фильтрация пользователей джанго для чата
function filterUser() {
  var input, filter, ul, li, a, i, txtValue;
  input = document.getElementById('inputFilterUser');
  filter = input.value.toUpperCase();
  ul = document.getElementById("listUser");
  li = ul.getElementsByTagName('li');
  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    txtValue = li[i].innerHTML;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}



// Отправка сообщения в чат
async function save_chat(pk_user_to,message){

    let response = await fetch('save_chat/' + pk_user_to,
        {
	    method: "POST",
	    headers:{'Content-Type': 'application/json','X-CSRFToken': csrf_token},
        body: JSON.stringify({'message':message}),
	    }
	);
    if (response.ok) { // если HTTP-статус в диапазоне 200-299
      // получаем тело ответа (см. про этот метод ниже)
      let json = await response;
          console.log(response.status)
    } else {
      alert("Ошибка HTTP: " + response.status);
    }
}



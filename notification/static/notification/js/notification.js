const ws_url_notification = 'ws://' + window.location.host + '/ws/notification/'
var socket;
var connected = false;
var callAudio = new Audio();
callAudio.src = staticRoot + 'audio/call.mp3'; // Указываем путь к звуку "клика"
var msgAudio = new Audio();
msgAudio.src = staticRoot + 'audio/msg.mp3'; // Указываем путь к звуку "клика"
var opensUserChat = ''
var countChatMessage = 0

var queryMess = 0;


function createNotificationDOM(type,text,autoClose=true,layout='topRight') {
  // Интерфейс-обертка для noty.js
     function wait_create_notification() {
        // ф-ия очереди в noty работает некорректно и не показывает уведомления
        // больше 5-ти за раз. Это ф-ия призвана ожидать
            if(queryMess >= 5){
                console.log('ожидание очереди сообщений')
                timerId = setTimeout(wait_create_notification, 1000);
            }
            else{
                queryMess = queryMess + 1
                var notify = new Noty({
                    callbacks: {
                        afterClose: function(){queryMess = queryMess - 1}
                    }
                })
                notify.show();
                notify.setType(type);
                notify.setText(text);
                notify.setTheme('metroui');
                if (autoClose){
                    notify.setTimeout(3000);
                }
                clearTimeout(timerId);
            }
        }
        var timerId = setTimeout(wait_create_notification,0)
}


typeof WebSocket !== 'undefined' && function connect() {
    socket = new WebSocket(ws_url_notification);
    socket.onmessage = onMessage;
    socket.onopen = onOpen;
    socket.onerror = err => {
        if (document.getElementById('msg-notification') == null && connected == false){
            createNotificationDOM('error','нет соединения с сервером',false)
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
        createNotificationDOM(data.status,data.message,data.auto_close)
    }

}

// Ответить серверу (послать на сервер)
function answerNotification(answer){
    socket.send(JSON.stringify({'message': answer}))
}


function createNotificationCHATDOM(user_from,user_from_pk, message){
// звонок
  let notify = new Noty({
    text        : '<h3 style="margin:0">' + user_from + '</h3><hr><b>' + message + '</b>',
    type        : 'alert',
    layout      : 'bottomRight',
    theme       : 'metroui',
    timeout     : 3000,

    buttons: [
        Noty.button('Ответить', 'n-btn n-btn-success', function () {
            callAudio.pause();
            notify.close();
        }),
  ]
  }).show();
   // звуковое сопровождение
   msgAudio.play()
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
    input.placeholder="  Поиск по имени.."
    color = document.createElement('input')
    color.type="color"
    div.appendChild(color)


    let ul = document.createElement('ul')
    ul.id = 'listUser'
    document.body.appendChild(div)
    div.appendChild(input)
    div.appendChild(ul)



    let response = await fetch('/notification/get_users/');
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
    textarea.placeholder = 'shift + enter чтобы отправить'
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


    let response = await fetch('/notification/get_chat/' + requestUserPk + '/' + pk_user_to.toString());
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

    let response = await fetch('/notification/save_chat/' + pk_user_to,
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


function setBackground(color){
    localStorage.setItem('notification-background-color')
}



function createCallDOM () {
// звонок
  let notify = new Noty({
    text        : '<center><h2>входящий звонок</h2></center>',
    type        : 'alert',
    layout      : 'center',
    theme       : 'metroui',
    closeWith:['button'],
    modal: true,

    buttons: [
    Noty.button('Принять', 'n-btn n-btn-success', function () {
        answerNotification('call-yes');
        callAudio.pause();
        notify.close();

    }, {id: 'button1', 'data-status': 'ok'}),

    Noty.button('Отклонить', 'n-btn n-btn-danger n-float-right', function () {
        answerNotification('call-no');
        callAudio.pause();
        notify.close();

    })
  ]
  }).show();
   // звуковое сопровождение
   callAudio.play()
}


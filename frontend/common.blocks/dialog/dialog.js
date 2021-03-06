modules.define(
    'dialog',
    ['i-bem__dom', 'BEMHTML', 'socket-io', 'i-chat-api', 'i-users', 'user', 'list',
        'message', 'keyboard__codes', 'jquery', 'notify', 'notify-native', 'events__channels', 'functions__debounce', 'easel__canvas'],
    function(provide, BEMDOM, BEMHTML, io, chatAPI, Users, User, List, Message, keyCodes, $, Notify, Notification, channels, debounce, Easel){
        var EVENT_METHODS = {
            'click-channels' : 'channels',
            'click-users' : 'im'
        };

        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){

                        this._textarea = this.findBlockInside('textarea');
                        this._container = this.elem('container');
                        this._page = this.findBlockOutside('page');
                        this._dropZone = this._page.findBlocksInside('drop-zone')[0];
                        this._easel = this._page.findBlocksInside('easel')[0];
                        this._canvas = this._easel.findElem('canvas')[0];
                        this._buttonDraw = this.elem('button-draw')[0];

                        var _this = this;
                        var timeout;

                        this._buttonDraw.addEventListener('click', function(){
                            _this._easel.toggleMod('visible', true);
                        });

                        document.body.ondragover = function(e){
                            e.preventDefault();
                            var dt = e.dataTransfer;
                            if(dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))){
                                clearTimeout(timeout);
                                _this._dropZone.setMod('visible', true);
                            }
                            return false;
                        };
                        document.body.addEventListener('dragleave',function(e){
                            e.preventDefault();
                            timeout = setTimeout(function(){
                                _this._dropZone.setMod('visible', false);
                            }, 300);
                            return false;
                        }, false);

                        document.body.ondrop = function(e){
                            _this._sendFiles(e.dataTransfer.files);
                            return false;
                        };

                        List.on('click-channels click-users', this._onChannelSelect, this);
                        User.on('click', this._onUserClick, this);

                        this._textarea.bindTo('keydown', this._onConsoleKeyDown.bind(this));
                        this._textarea.bindTo('input', this._onTyping.bind(this));
                        this.bindTo('history', 'wheel DOMMouseScroll mousewheel', this._onHistoryScroll.bind(this));
                        this._subscribeMessageUpdate();

                        chatAPI.on('user_typing', function(data){
                            if(data.channel == _this._channelId){
                                if(_this.typingTimeout) clearTimeout(_this.typingTimeout);
                                _this.setMod($(_this.elem('typing')), 'visible');
                                _this.elem('typing')[0].innerText = Users.getUser(data.user).real_name+' typing...';
                                _this.typingTimeout = setTimeout(function(){
                                    _this.delMod($(_this.elem('typing')), 'visible');
                                },5000);
                            }
                        });

                    }
                }
            },

            destruct : function(){
                List.un('click-channels click-users');
            },

            _subscribeMessageUpdate : function(){
                var _this = this;
                var shrimingEvents = channels('shriming-events');
                var generatedMessage;

                chatAPI.on('message', function(data){
                    console.log('RTC.message', data);
                    if(Users.myId!=data.user){
                        Notification.send(Users.getUser(data.user).real_name, data.text, function(){
                            var lists = _this.findBlocksOutside('page')[0].findBlocksInside('list');
                            for(i=0;i<lists.length;i++){
                                var items = lists[i].findElem('item');
                                for(j=0;j<items.length;j++){
                                    var itemData = lists[i].elemParams($(items[j]));
                                    if(data.channel == itemData.channelId){
                                        if(lists[i].findBlocksInside($(items[j]), 'user')){
                                            lists[i].findBlocksInside($(items[j]), 'user')[0].domElem.click();
                                        } else items[j].click();
                                    }
                                }
                            }
                        });
                    }
                    if(_this._channelId && data.channel === _this._channelId){
                        generatedMessage = _this._generateMessage(data);
                        BEMDOM.append(_this._container, generatedMessage);
                        _this._scrollToBottom();
                    }else{
                        shrimingEvents.emit('channel-received-message', { channelId : data.channel });
                    }
                });
            },

            _onTyping : function(){
                var _this = this;
                if(!this.lastTyping || this.lastTyping < Date.now()-4000){
                    chatAPI.send({
                        "id": 1,
                        "type": "typing",
                        "channel": _this._channelId
                    });
                    this.lastTyping = Date.now();
                }
            },

            _onUserClick : function(e, userParams){
                var dialogControlBlock = this.findBlockInside('dialog-controls');
                var callButton = dialogControlBlock.findElem('call');

                if(userParams.presence != 'local') {
                    dialogControlBlock.setMod(callButton, 'disabled');
                    dialogControlBlock.setMod(callButton, 'disabled');
                    return;
                }

                dialogControlBlock.delMod(callButton, 'disabled');
                callButton.data('slackId', userParams.id);
            },

            _onChannelSelect : function(e, data){
                this._channelId = data.channelId;
                this._channelType = EVENT_METHODS[e.type];
                this._tsOffset = 0;

                this.elem('name').text(data.name);
                this.findBlockInside('editable-title')
                    .reset()
                    .setVal(this._channelId, data.title, (e.type == 'click-channels'));

                switch(e.type) {
                    case 'click-channels':
                        this.findBlockInside('dialog-controls').setMod('type', 'channels');
                        this.setMod(this.elem('name'), 'type', 'channels');

                        break;

                    case 'click-users':
                        this.findBlockInside('dialog-controls').setMod('type', 'user');
                        this.setMod(this.elem('name'), 'type', 'users');

                        break;

                    default:

                }

                BEMDOM.update(this._container, []);
                this.setMod(this.elem('spin'), 'visible');
                this._getData();
            },

            _onHistoryScroll : debounce(function(e){
                var history = this.elem('history');
                
                if((e.type === 'wheel' || e.type === 'DOMMouseScroll' || e.type === 'mousewheel') && history.scrollTop() === 0){
                    this.setMod(this.elem('spin'), 'visible');
                    this._getData(true);
                }
            }, 100),

            _markChannelRead : function(timestamp){
                chatAPI.post(this._channelType + '.mark', {
                    channel : this._channelId,
                    ts : timestamp
                })
                    .then(function(data){
                        console.log('Channel mark: ', data);
                    })
                    .catch(function(){
                        Notify.error('Ошибка при открытии канала!');
                    });
            },

            _getData : function(infiniteScroll){
                var _this = this;

                this.elem('blank').hide();

                chatAPI.post(this._channelType + '.history', {
                    channel : this._channelId,
                    latest : infiniteScroll? this._tsOffset : 0
                })
                    .then(function(resData){
                        var messages = resData.messages.reverse();
                        var messagesList = messages.map(function(message){
                            return _this._generateMessage(message);
                        });

                        if(messages.length){
                            _this._markChannelRead(messages[messages.length - 1].ts);
                            _this._tsOffset = messages[0].ts;
                        }else{
                            _this.elem('blank').show();
                        }

                        if(infiniteScroll){
                            BEMDOM.prepend(_this._container, messagesList.join(''));
                        }else{
                            BEMDOM.update(_this._container, messagesList);
                            _this._scrollToBottom();
                        }
                    })
                    .catch(function(){
                        Notify.error('Ошибка загрузки списка сообщений!');
                    })
                    .always(function(){
                        _this.delMod(_this.elem('spin'), 'visible');
                    });
            },

            _generateMessage : function(message){
                var user = Users.getUser(message.user) || {};
                return Message.render(user, message);
            },

            /**
             * Прокручивает блок с сообщениями к последнему сообщению
             *
             * @private
             */
            _scrollToBottom : function(){
                var historyElement = this.elem('history');
                var historyElementHeight;

                if(historyElement.length){
                    historyElementHeight = historyElement[0].scrollHeight;
                    $(historyElement).scrollTop(historyElementHeight);
                }
            },

            _onConsoleKeyDown : function(e){
                if(e.keyCode === keyCodes.ENTER && !e.ctrlKey){
                    e.preventDefault();

                    if(!this._textarea.hasMod('emoji')){
                        this._sendMessage(e.target.value);
                        e.target.value = '';
                    }
                }
            },

            _sendMessage : function(message){
                var _this = this;
                var base64 = false;
                if(Easel.getImage()){
                    base64 = '[BASE64'+Easel.file()+']';
                }

                if(!this._channelId) {
                    return;
                }

                chatAPI.post('chat.postMessage', {
                    text : base64 ? message+base64 : message,
                    channel : _this._channelId,
                    username : _this.params.username,
                    as_user : true
                }).then(function(){
                    _this.elem('blank').hide();
                }).catch(function(){
                    Notify.error('Ошибка при отправке сообщения!');
                });
            },
            _sendFiles : function(files){
                var _this = this;
                _this._progress = this.findBlocksOutside('page')[0].findBlocksInside('drop-zone')[0].findElem('progress')[0];

                if(!this._channelId) {
                    return;
                }
                for(var i = 0; i < files.length; i++){
                    chatAPI.file({
                        filename : files[i].name,
                        type : files[i].type,
                        file : files[i],
                        channels : _this._channelId
                    },function(e){
                        this._progress.style.height = e+'%';
                        this._dropZone.setMod('upload', true);
                    }.bind(this),
                    function(result){
                        this._dropZone.setMod('visible', false);
                        _this._dropZone.setMod('upload', false);
                        _this._progress.style.height = 0;
                    }.bind(this));
                }
            }
        }));
    }
);

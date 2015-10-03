modules.define(
    'list',
    ['i-bem__dom', 'BEMHTML', 'jquery', 'i-chat-api'],
    function(provide, BEMDOM, BEMHTML, $, chatAPI){
        var LISTS = {
            users : 'members',
            channels : 'channels',
            groups : 'groups'
        };

        provide(BEMDOM.decl('list', {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        var instances = this.__self.instances || (
                                this.__self.instances = []);
                        var type = this.getMod('type');

                        instances.push(this);
                        this._getListData(type);

                        if(!chatAPI.isOpen()) {
                            // Нужен на время тестирования
                            var TOKEN = "xoxp-11352820727-11352369638-11388775793-8454f5e6e0";
                            chatAPI.setToken(TOKEN);
                        }

                        chatAPI.on('*', function(message){
                            console.log(message);
                        });
                    }
                }
            },

            _getListData : function(type){
                var container = this.elem('container');

                chatAPI.get(type + '.list', {}).then(function(data){
                    var items = data[LISTS[type]];

                    items.forEach(function(item){
                        BEMDOM.append(container,
                            BEMHTML.apply({
                                block : 'list',
                                elem : 'item',
                                mods : { type : type },
                                content : item.name,
                                js : {
                                    id : item.id,
                                    name : item.name
                                }
                            })
                        );
                    });
                });
            },

            _onItemClick : function(e){
                var item = $(e.currentTarget);
                var type = this.getMod(item, 'type');

                this.__self.instances.forEach(function(list){
                    list.delMod(list.elem('item'), 'current');
                });

                this.setMod(item, 'current', true);
                this.emit('click-' + type, this.elemParams(item));
            }
        }, {
            live : function(){
                this.liveBindTo('item', 'click', function(e){
                    this._onItemClick(e);
                });

                return false;
            }
        }));
    }
);

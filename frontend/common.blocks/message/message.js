modules.define('message', ['i-bem__dom', 'BEMHTML', 'i-users'], function(provide, BEMDOM, BEMHTML, Users){
    provide(BEMDOM.decl(this.name, {}, {
            render : function(user, message){
                console.log(message);
                var date = new Date(Math.round(message.ts) * 1000);
                var username = user ? (user.real_name || user.name) : 'Бот какой-то';
                var text = this._parseSystemMessage(message.text);

                var _getSimpleDate = function(date){
                    var hours = ('0' + date.getHours()).slice(-2);
                    var minutes = ('0' + date.getMinutes()).slice(-2);

                    return hours + ':' + minutes;
                };

                var content = [
                    {
                        block : 'avatar',
                        user : {
                            name : username,
                            image_48 : user.profile.image_48
                        },
                        mods : { size : 'm' },
                        mix : { block : 'message', elem : 'avatar' }
                    },
                    { elem : 'username', content : username },
                    { elem : 'time', content : _getSimpleDate(date) },
                    { elem : 'content', content : text }
                ];

                if(message.file){

                    var url = message.file.url;
                    var target = '_blonk';
                    if(message.file.url_download){
                        url = message.file.url_download;
                        target = '_self';
                    }

                    if(/jpg|png/i.test(message.file.filetype)) {
                        content.push({
                            block : 'link',
                            mix : { block : 'message', elem : 'link', mods : { image : true } },
                            url : url,
                            target : target,
                            content : {
                                block : 'image',
                                mix : { block : 'message', elem : 'image' },
                                url : message.file.thumb_360
                            }
                        });
                        content[3].content = {
                            block : 'link',
                            mix : { block : 'message', elem : 'link' },
                            url : url,
                            target : target,
                            content : message.file.name
                        };
                    } else if ( message.file.filetype ){

                        content[3] = NaN;

                        var size = message.file.size;

                        if (size < 1024) {
                            size = size + ' B';
                        } else if(size < 1024*1024){
                            size = (size / 1024).toFixed(2) + ' KB';
                        } else {
                            size = (size / 1024 / 1024).toFixed(2) + ' MB';
                        }

                        content.push({
                            block : 'link',
                            mix : { block : 'message', elem : 'link', mods : { file : true } },
                            url : url,
                            target : target,
                            content : [
                                {
                                    block : 'file',
                                    params : {
                                        type : message.file.filetype,
                                        name : message.file.name,
                                        size : size
                                    }
                                }
                            ]
                        });
                    }
                }

                return BEMHTML.apply(
                    {
                        block : 'message',
                        mix : [{ block : 'dialog', elem : 'message' }],
                        content : content
                    }
                );
            },

            _parseSystemMessage : function(message){
                var regexp = {
                    system : /<@(.*)\|(.*)>/g,
                    pm : /<@(.*)>/g
                };

                var matchSystem = regexp.system.exec(message);
                var matchPm = regexp.pm.exec(message);

                if(matchSystem){
                    message = '@' + matchSystem[2] + message.replace(regexp.system, '');
                } else if(matchPm){
                    message = '@' + Users.getUser(matchPm[1]).name + message.replace(regexp.pm, '');
                }

                return message;
            }
        }
    ));
});

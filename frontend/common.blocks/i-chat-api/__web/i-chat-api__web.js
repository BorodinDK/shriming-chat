/**
 * Запросы к Slack API
 * @module
 */
modules.define('i-chat-api__web', ['socket-io', 'jquery', 'vow'],
    function(provide, io, $, vow){
        var api = {
            /**
             * GET-запрос
             *
             * @param {String} action - код API метода
             * @param {Object} params - передаваемые данные
             * @return {Promise}
             */
            get : function(action, params){
                return connect(action, params, 'get');
            },
            /**
             * POST-запрос
             *
             * @param {String} action - код API метода
             * @param {Object} params - передаваемые данные
             * @return {Promise}
             */
            post : function(action, params){
                return connect(action, params, 'post');
            },

            file : function(params, progress, callback){
                io.socket.get('/getToken', function(data){
                    var formData = new FormData();
                    params['token'] = data.token;
                    for(var k in params) formData.append(k, params[k]);
                    var xhr = new XMLHttpRequest();

                    xhr.open("POST", "https://slack.com/api/files.upload");

                    xhr.upload.addEventListener('progress', function(event){
                        progress((event.loaded/event.total*100).toFixed(1));
                        // console.log( 'Загружено на сервер ' + event.loaded + ' байт из ' + event.total +', ' + (event.loaded/event.total*100).toFixed(1) + '%' );
                    });

                    xhr.addEventListener('load', function(event){
                        callback(this.response);
                    });
                    xhr.send(formData);
                });
                return false;
            }
        };

        function connect(action, params, method){
            params = params || {};
            method = method || 'get';

            var promise = new vow.Promise(function(resolve, reject){
                $.get('/csrfToken')
                    .done(function(data){
                        var url = '/slack/' + action;
                        $.extend(params, { _csrf : data._csrf });

                        io.socket[method](url, params, function(resData, jwres){
                            if(!resData || resData.error || jwres.statusCode !== 200) {
                                reject(resData.error || 'Ошибка подключения к API');

                                return;
                            }

                            resolve(resData.data);
                        });
                    })
                    .fail(function(err){
                        reject(err);
                    });
            });

            return promise;
        }

        provide(api);
    }
);

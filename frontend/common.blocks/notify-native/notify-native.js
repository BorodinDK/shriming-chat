modules.define('notify-native', ['i-bem__dom'], function(provide, BEMDOM){

    var iNotify = {
        send : function(title, text, callback){
            if (Notification.permission === "granted"){
                var options = {
                    body: text,
                };
                var notification = new Notification(title, options);
                notification.onclick = function(){
                    window.focus();
                    callback();
                };
            }

            else if (Notification.permission !== 'denied') {
                Notification.requestPermission(function(permission){
                    iNotify.send(text, callback);
                });
            }
        }
    };

    provide(iNotify);
});

modules.define('call-confirm', ['i-bem__dom', 'BEMHTML'], function(provide, BEMDOM, BEMHTML){
    provide(BEMDOM.decl(this.name, {
        onSetMod : {
            js : {
                inited : function(){
                    alert('УРА!');
                    console.log('1', this);
                }
            }
        },
        _onClick : function(){
            alert('click');
        }
    }, {
            live : function(){
                this.liveBindTo('click', function(e){
                    this._onClick(e);
                });
                alert('live');
            }
        }
    ));
});

modules.define(
    'dialog__typing',
    ['i-bem__dom', 'BEMHTML'],
    function(provide, BEMDOM, BEMHTML){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                    }
                }
            },
        }));
    }
);

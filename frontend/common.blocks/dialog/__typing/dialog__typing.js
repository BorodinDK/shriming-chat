modules.define(
    'dialog__typing',
    ['i-bem__dom', 'BEMHTML'],
    function(provide, BEMDOM, BEMHTML){
        provide(BEMDOM.decl(this.name, {
            onElemSetMod : {
                '*' : function(){
                },
                'visible' : function(){
                   // visible
                }
            },
            onSetMod : {
                '*' : function(){
                },
                'js' : {
                    'inited' : function(){
                    }
                }
            },
        }));
    }
);

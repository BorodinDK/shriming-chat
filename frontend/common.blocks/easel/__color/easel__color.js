modules.define(
    'easel__color',
    ['i-bem__dom', 'BEMHTML', 'easel__canvas'],
    function(provide, BEMDOM, BEMHTML, Easel){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        var _this = this;
                        this.domElem[0].style.background = this.params.color;
                        this.domElem[0].addEventListener('click', function(){
                            Easel.setColor(_this.params.color);
                        });
                    }
                }
            },
        }));
    }
);

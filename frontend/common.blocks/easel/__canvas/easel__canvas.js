modules.define(
    'easel__canvas',
    ['i-bem__dom', 'BEMHTML', 'socket-io'],
    function(provide, BEMDOM, BEMHTML, io){
        provide(BEMDOM.decl(this.name, {
            onSetMod : {
                'js' : {
                    'inited' : function(){
                        window.easel = this;
                        this.image = false;
                        this.init();
                    }
                }
            },
            clear : function(){
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            },
            close : function(){

                var page = this.findBlockOutside('page');
                page.findBlocksInside('easel')[0].delMod('visible');

                this.clear();
            },
            init : function(){
                console.log('init');
                var _this = this;

                this.drawing = false;
                this.canvas = this.domElem[0];
                this.canvas.width = 360;
                this.canvas.height = 300;
                this.ctx = this.canvas.getContext('2d');

                this.ctx.fillStyle = "#FFF";
                this.clear();
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';

                this.canvas.onmousedown = function(e){
                    _this.image = true;
                    _this.rect = _this.canvas.getBoundingClientRect();
                    _this.drawing = true; 
                    _this.ctx.beginPath();
                    _this.ctx.moveTo(e.clientX - _this.rect.left, e.clientY -_this.rect.top);
                };

                this.canvas.onmousemove = function(e){
                    if(_this.drawing){                    
                        _this.ctx.lineTo(e.clientX - _this.rect.left, e.clientY -_this.rect.top);
                        _this.ctx.stroke();
                        console.log(e, 'e');
                    }
                };

                this.canvas.onmouseup = function(e){
                    _this.drawing = false; 
                    _this.ctx.lineTo(e.clientX - _this.rect.left, e.clientY -_this.rect.top);
                };

            }
        },{
            file : function(){
                var image = window.easel.canvas.toDataURL("image/jpeg", 0.08).split(',')[1];
                window.easel.close();
                return image;
            },
            getImage : function(){
                return window.easel.image;
            },
            setColor : function(color){
                window.easel.ctx.strokeStyle = color;
            }
        }));
    }
);

module.exports = {
    get : function(req, res){
        console.log('ECHO');
        console.log(req.params.all());
        var base64 = req.query.base64;
        if(base64){
            //console.log(base64);
            var buf = new Buffer(base64, 'base64');
            //res.attachment('test.txt');
            res.end(buf, 'UTF-8');
        } else {
            return res.json({
                error : true
            });
        }
    }
};

module.exports = {
    get : function(req, res){
        Passport.findOne({
            identifier : req.user.id
        }, function(err, passport){
            return res.json({
                token : passport.tokens.accessToken
            });
        });
    }
};

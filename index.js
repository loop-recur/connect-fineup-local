var Promise = require('bluebird');
var _ = require('lodash');
var fs = require('fs'), tmp = require('tmp');
var Busboy = require('busboy');

var mod;
module.exports = mod = {
  write: function(file_opts, stream){
    return new Promise(function(resolve, reject){
      if(!stream){reject(new Error('Must provide a stream'));}
      if(!file_opts.dir){
        reject(new Error('Must provide a directory to save to'));
      }
      if(file_opts.name){
        var fn = file_opts.dir+'/'+file_opts.name;
        var ws = fs.createWriteStream(fn)
        stream.pipe(ws).on('error', reject).on('finish', function(){
          resolve(file_opts.name);
        });
      }
      else {
        Promise.promisify(tmp.tmpName)({
          dir: file_opts.dir,
          prefix: '',
        }).then(function(name) {
          stream.pipe(fs.createWriteStream(name))
          .on('error', reject).on('finish', function(){
            resolve(_.last(name.split('/')));
          });
        });
      }
    });
  },
  mware: function(opts){
    //__dirname should be node_modules/connect-fineup-local from the app
    //root. We want the download to be relative to the apps public dir
    var dir = __dirname+'/../../public/'+opts.dir;
    return function(req, res, next){
      var bb = new Busboy({headers: req.headers});
      bb.on('file', function(fieldname, file, filename, encoding, mimetype){
        mod.write(_.assign({}, opts, {dir: dir}), file).then(function(name){
          res.fileUrl = req.headers.host+'/'+opts.dir+'/'+name;
          next();
        }, function(err){console.log(err); res.send(500, err)});
      });
      req.pipe(bb);
    }
  },
  fineupRoute: function(opts){
    return function(req, res){
      mod.mware(opts)(req, res, function(){
        res.set('Content-Type', 'text/plain'); //prevents download dialog on IE9
        res.send(200, {success: true, url: res.fileUrl});
      });
    };
  },
};

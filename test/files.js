var _ = require('lodash'), assert = require('chai').assert;
var fs = require('fs');

var local = require('../index');

describe('local', function(){
  beforeEach(function(){
    this.file = fs.createReadStream(__filename);
  });

  describe('write', function(){
    it('fails without a stream', function(done){
      local.write().then(done, function(err){
        assert.match(err, /stream/);
        done();
      });
    });

    it('fails without a stream', function(done){
      local.write({}, this.file).then(done, function(err){
        assert.match(err, /directory/);
        done();
      });
    });

    it('writes to the specified file', function(done){
      local.write({dir: __dirname, name: 'temporary'}, this.file).then(function(name){
        assert.equal(name, 'temporary');
        assert.equal(
          fs.readFileSync(__dirname+'/temporary').toString(),
          fs.readFileSync(__filename).toString()
        );
        fs.unlinkSync(__dirname+'/temporary');
        done();
      }).catch(done);
    });

    it('returns a unique file name if no name is specified', function(done){
      local.write({dir: __dirname}, this.file).then(function(name){
        assert.equal(
          fs.readFileSync(__dirname+'/'+name).toString(),
          fs.readFileSync(__filename).toString()
        );
        fs.unlinkSync(__dirname+'/'+name);
        done();
      }).catch(done);
    });
  });
});

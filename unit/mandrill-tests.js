var mandrill = require('../mandrill'),
    util     = require('util'),
    fs       = require('fs');

mandrill.call(JSON.parse(fs.readFileSync(__dirname + '/../' + 'configure.json', 'utf8')));

exports.testMandrillApiCalls = function(test) {
    mandrill.call('get_api_calls', function(data) {
        test.ok(data);
        test.equals(7,Object.keys(data).length);
        test.done();
    });
}

exports.testMandrill = function(test) {
    mandrill.call({'type':'users','call':'info'}, function(data) {
        test.ok(data);
        test.ok(data.username);
        test.done();
    });
}

exports.testMandrillKeyCache = function(test) {
    mandrill.call({'type':'users','call':'info'}, function(data) {
        test.ok(data);
        test.ok(data.username);
        test.done();
    });
}

exports.testBadType = function(test) {
    test.throws(function() {mandrill.call({'type':'bad_users','call':'info'})},'Invalid type');
    test.done();
}

exports.testBadCall = function(test) {
    test.throws(function() {mandrill.call({'type':'users','call':'bad_info'})},'Invalid call');
    test.done();
}

exports.testExtraProperties = function(test) {
    test.throws(function() {mandrill.call({'type':'users','call':'info','extra':'property'})},'Invalid options passed');
    test.done();
}
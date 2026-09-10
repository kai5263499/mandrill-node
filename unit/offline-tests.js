/* Offline regression tests: no network, API key, or installed dependencies needed. */
var assert = require('assert'),
    fs = require('fs'),
    vm = require('vm'),
    util = require('util');

var source = fs.readFileSync(__dirname + '/../mandrill.js', 'utf8');
var manifest = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf8'));
var requests = [];
var responseBody = '{"ok":true}';
var sandbox = {
    exports: {},
    console: { log: function() {} },
    require: function(name) {
        if(name === 'util') return util;
        if(name === 'request') return function(options, callback) {
            requests.push(options);
            callback(null, { statusCode: 200 }, responseBody);
        };
        throw new Error('Unexpected dependency: ' + name);
    }
};

assert.strictEqual(manifest.dependencies.underscore, undefined);
vm.runInNewContext(source, sandbox, 'mandrill.js');
assert.strictEqual(sandbox.util, undefined, 'util must not leak into the global scope');
var call = sandbox.exports.call;
var expected = {
    users: {
        info: [], ping: [], senders: [],
        'disable-sender': ['domain'], 'verify-sender': ['email']
    },
    messages: {
        send: ['message'],
        'send-template': ['template_name', 'template_content', 'message'],
        search: ['query', 'date_from', 'date_to', 'tags', 'senders', 'limit']
    },
    tags: { list: [], info: ['tag'], 'time-series': ['tag'], 'all-time-series': [] },
    senders: { list: [], info: ['address'], 'time-series': ['address'] },
    urls: { list: [], search: ['q'], 'time-series': ['url'] },
    templates: {
        add: ['name', 'code'], info: ['name'], update: ['name', 'code'],
        'delete': ['name'], list: []
    },
    webhooks: {
        list: [], add: ['url', 'events'], info: ['id'],
        update: ['id', 'url', 'events'], 'delete': ['id']
    }
};
var catalog;
call('get_api_calls', function(result) { catalog = JSON.parse(JSON.stringify(result)); });
assert.deepEqual(Object.keys(catalog).sort(), Object.keys(expected).sort());

var count = 0;
Object.keys(expected).forEach(function(type) {
    assert.deepEqual(Object.keys(catalog[type]).sort(), Object.keys(expected[type]).sort());
    Object.keys(expected[type]).forEach(function(action) {
        assert.deepEqual(catalog[type][action], ['key'].concat(expected[type][action]));
        var options = { type: type, call: action, key: 'offline-test-key' };
        var body = { key: 'offline-test-key' };
        expected[type][action].forEach(function(key) {
            options[key] = body[key] = 'test-' + key;
        });
        var result;
        var before = requests.length;
        call(options, function(value) { result = value; });
        assert.strictEqual(requests.length, before + 1);
        var request = requests[requests.length - 1];
        assert.strictEqual(request.method, 'POST');
        assert.strictEqual(request.uri, 'https://mandrillapp.com/api/1.0/' + type + '/' + action + '.json');
        assert.deepEqual(JSON.parse(request.body), body);
        assert.strictEqual(result.ok, true);
        count++;
    });
});
assert.strictEqual(count, 28);

function rejects(options, message) {
    var before = requests.length;
    assert.throws(function() { call(options, function() {}); }, function(error) {
        return error === message;
    });
    assert.strictEqual(requests.length, before, 'invalid input must not make a request');
}
rejects({ type: 'bad_users', call: 'info' }, 'Invalid type');
rejects({ type: 'users', call: 'bad_info' }, 'Invalid call');
rejects({ type: 'users', call: 'info', extra: 'property' }, 'Invalid options passed');
rejects({ type: 'users', call: 'info', toString: 'not-allowed' }, 'Invalid options passed');
var nullPrototype = Object.create(null);
nullPrototype.type = 'users';
nullPrototype.call = 'info';
nullPrototype.extra = 'property';
rejects(nullPrototype, 'Invalid options passed');

var before = requests.length;
var missing;
assert.strictEqual(call({ type: 'users' }, function(value) { missing = value; }), false);
assert.strictEqual(missing, false);
assert.strictEqual(requests.length, before);

call({ type: 'users', call: 'ping' }, function() {});
assert.strictEqual(JSON.parse(requests[requests.length - 1].body).key, 'offline-test-key');
var inherited = Object.create({ ignored: 'inherited-option' });
inherited.type = 'users';
inherited.call = 'ping';
call(inherited, function() {});
assert.deepEqual(JSON.parse(requests[requests.length - 1].body), { key: 'offline-test-key' });

responseBody = 'invalid JSON';
var failure;
call({ type: 'users', call: 'ping' }, function(value) { failure = value; });
assert.strictEqual(failure.status, 'error');
assert.strictEqual(failure.code, -1);
assert.strictEqual(failure.body, 'invalid JSON');
console.log('PASS: all 28 API calls, option validation, key caching, error handling, and no Underscore import.');

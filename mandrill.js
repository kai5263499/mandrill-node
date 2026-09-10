exports.call = (function() {
    var request = require('request'),
        util    = require('util');
    
    var _mandrill_api_url = 'https://mandrillapp.com/api/1.0/%s/%s.json';
    
    var _api_key;
    
    var _key = ["key"];
    
    var _api_calls = {
            /* Users Calls */
            'users':{
                'info'             : _key,
                'ping'             : _key,
                'senders'          : _key,
                'disable-sender'   : _key.concat(['domain']),
                'verify-sender'    : _key.concat(['email'])
            },
            
            /* Messages Calls */
            'messages':{
                'send'             : _key.concat(['message']),
                'send-template'    : _key.concat(['template_name','template_content','message']),
                'search'           : _key.concat(['query','date_from','date_to','tags','senders','limit'])
            },
            
            /* Tags Calls */
            'tags':{
                'list'             : _key,
                'info'             : _key.concat(['tag']),
                'time-series'      : _key.concat(['tag']),
                'all-time-series'  : _key
            },
            
            /* Senders Calls */
            'senders':{
                'list'             : _key,
                'info'             : _key.concat(['address']),
                'time-series'      : _key.concat(['address'])
            },
            
            /* Urls Calls */
            'urls':{
                'list'             : _key,
                'search'           : _key.concat(['q']),
                'time-series'      : _key.concat(['url'])
            },
            
            /* Templates Calls */
            'templates':{
                'add'              : _key.concat(['name','code']),
                'info'             : _key.concat(['name']),
                'update'           : _key.concat(['name','code']),
                'delete'           : _key.concat(['name']),
                'list'             : _key
            },
            
            /* Webhooks Calls */
            'webhooks':{
                'list'             : _key,
                'add'              : _key.concat(['url','events']),
                'info'             : _key.concat(['id']),
                'update'           : _key.concat(['id','url','events']),
                'delete'           : _key.concat(['id'])
            }
        };
    
    var _validate = function(type, call, opts, cb) {
        if(!_api_calls[type]) {
            console.log('Throwing invalid type');
            throw "Invalid type";
        }
        
        if(!_api_calls[type][call]) throw "Invalid call";
        
        var allowed = _api_calls[type][call];
        if(Object.keys(opts).some(function(key) {
            return allowed.indexOf(key) === -1;
        })) throw "Invalid options passed";
    }
    
    var _callMandrillApi = function(type, call, opts, cb) {
        opts['key'] = _api_key;
        var parsed_url = util.format(_mandrill_api_url, type, call);
        var opts_str = JSON.stringify(opts);
        
        request({
            method:'POST',
            uri:parsed_url,
            body: opts_str
        }, function (error, response, body) {
            try {
                cb(JSON.parse(body));
            } catch(e) {
                cb({  status: 'error',
                      code: -1,
                      name: 'Mandrill API service exception',
                      message: 'An error has ocurred while communicating with the Mandrill API',
                      body: body,
                      response: response,
                      error: error});
            }
        });
    };
    
    return function(opts,cb) {
        if(typeof opts == "string") {
            var ret = null;
            
            switch(opts) {
                case 'get_api_calls':
                    ret = _api_calls;
                break;
            }
            
            if(cb && typeof cb == 'function') cb(ret);
        } else if(typeof opts == "object") {
            if(opts['key']) {
                _api_key = opts['key']; 
                delete opts['key'];
            }
            
            if(!opts['type'] || !opts['call']) {
                if(cb && typeof cb == 'function') cb(false);
                return false;
            }
            
            var type = opts['type'];
            var call = opts['call'];
            
            delete opts['type'];
            delete opts['call'];
            _validate(type, call, opts);
            _callMandrillApi(type, call, opts, cb);
        }
    }
})();

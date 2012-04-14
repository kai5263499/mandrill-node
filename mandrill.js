exports.call = (function() {
    var request = require('request'),
        _       = require('underscore');
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
                'disable-sender'   : _.union(_key, ['domain']),
                'verify-sender'    : _.union(_key, ['email'])
            },
            
            /* Messages Calls */
            'messages':{
                'send'             : _.union(_key, ['message']),
                'send-template'    : _.union(_key, ['template_name','template_content','message']),
                'search'           : _.union(_key, ['query','date_from','date_to','tags','senders','limit'])
            },
            
            /* Tags Calls */
            'tags':{
                'list'             : _key,
                'info'             : _.union(_key, ['tag']),
                'time-series'      : _.union(_key, ['tag']),
                'all-time-series'  : _key
            },
            
            /* Senders Calls */
            'senders':{
                'list'             : _key,
                'info'             : _.union(_key, ['address']),
                'time-series'      : _.union(_key, ['address'])
            },
            
            /* Urls Calls */
            'urls':{
                'list'             : _key,
                'search'           : _.union(_key, ['q']),
                'time-series'      : _.union(_key, ['url'])
            },
            
            /* Templates Calls */
            'templates':{
                'add'              : _.union(_key, ['name','code']),
                'info'             : _.union(_key, ['name']),
                'update'           : _.union(_key, ['name','code']),
                'delete'           : _.union(_key, ['name']),
                'list'             : _key
            },
            
            /* Webhooks Calls */
            'webhooks':{
                'list'             : _key,
                'add'              : _.union(_key, ['url','events']),
                'info'             : _.union(_key, ['id']),
                'update'           : _.union(_key, ['id','url','events']),
                'delete'           : _.union(_key, ['id'])
            }
        };
    
    var _validate = function(type, call, opts, cb) {
        if(!_api_calls[type]) {
            console.log('Throwing invalid type');
            throw "Invalid type";
        }
        
        if(!_api_calls[type][call]) throw "Invalid call";
        
        if(_.without(opts,_api_calls[type][call]).length > 0) throw "Invalid options passed";
    }
    
    var _callMandrillApi = function(type, call, opts, cb) {
        opts['key'] = _api_key;
        var parsed_url = util.format(_mandrill_api_url, type, call);
        var opts_str = JSON.stringify(opts);
        
        console.log(parsed_url,'parsed_url');
        console.log(opts_str,'opts_str');
        
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
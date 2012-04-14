var mandrill = require('mandrill'),
    fs       = require('fs');

mandrill.call(JSON.parse(fs.readFileSync('configure.json', 'utf8')));

mandrill.call({'type':'users','call':'ping'}, function(data){
    console.log(data);
});
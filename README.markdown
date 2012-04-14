# mandrill-node

mandrill-node is a node.js module for interfacing with MailChimp's Mandrill API

##Installation

Installing using npm (node package manager):

    npm install mandrill
    
If you don't have npm installed or don't want to use it:

    cd ~/.node_libraries
    git clone git://github.com/kai5263499/mandrill-node.git mandrill

```javascript
    //Include the mandrill module
    var mandrill = require('mandrill');
```

##Requirements

* A MailChimp account, Mandrill service enabled, Mandrill API key. See the Getting Started guide for more information http://help.mandrill.com/customer/portal/topics/214457-getting-started/articles
* node.js 0.6.10+
* request 2.9.100+
* underscore 1.3.3+

##Examples

```javascript
    // The key can be set either by passing the a an object which only
    // contains the key, ex.
    mandrill.call({'key':'mykey'});

    /**
     * They key could also be set with the request event. All request events
     * need to have at least a type and a call property set and these values
     * need to correspond to the valid types and calls recognized by the Mandrill
     * service.
     *
     * Here is an example of a call to Mandrill API's users.info
     * The docs for this call can be found at http://mandrillapp.com/api/docs/users.html#method=info
     */
    mandrill.call({'type':'users','call':'info'}, function(data){
        console.log(data);
    });
    
    // For a list of valid calls please visit http://mandrillapp.com/api/docs/index.html
```

##Contributions

The Mandrill node.js module is designed to be as static as Javascript allows, following a functional or lambda programming paradigm. If you want to learn more about this pattern of development and why this pattern was chosen above other, more traditional, javascript approaches please read the following excellent article http://howtonode.org/why-use-closure

If you would like to help maintain this project and/or if you have any questions or comments about the library's design or implementation I'd love to hear from you.

##Unit Tests

A unit test using nodeunit for the Mandrill module is avaliable in the 'unit' directory. You will need to copy the configure.json.example to configure.json and change the Mandrill API key from 'mykey' to your Mandrill API key in order for the tests to complete. If you want to contribute any bugfixes or examples please add a unit test for your code and make sure nothing else breaks.
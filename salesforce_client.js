// Request Salesforce credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Salesforce.requestCredential = function(options, credentialRequestCompleteCallback) {
    // support both (options, callback) and (callback).
    if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = null;
    }

    var config = ServiceConfiguration.configurations.findOne({
        service: 'salesforce'
    });
    var settings = Meteor.settings.public.salesforce;
    if (!config && !settings) {
        //at least the consumer key should be visible.
        credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError('Salesforce'));
        return;
    }

    //no config yet, we insert one, which will be used later by the core OAuth package.
    if(!config) {
        settings.service = 'salesforce';
        ServiceConfiguration.configurations.insert(settings);
    }

    var scope = options && options.requestPermissions || config && config.requestPermissions || settings && settings.requestPermissions || ['api'];
    var flatScope = scope.join(' ');

    
    var loginStyle = config && config.loginStyle || settings && settings.loginStyle || 'popup';
    var credentialToken = new Meteor.Collection.ObjectID();
    var endPoint = options && options.endPoint || config && config.endPoint || settings && settings.endPoint || 'login.salesforce.com';

    //we need to be able to configure whether it's a sandbox, prod, ... but somehow, there is no way to have
    //a proper way to forward the 'options' to the server hence here the weird workaround for providing the endpoint
    // to the server:
    var state = OAuth._stateParam(loginStyle, credentialToken._str, endPoint);

    var loginUrl = 'https://' + endPoint + '/services/oauth2/authorize' +
        '?response_type=code' + 
        '&client_id=' + (config && config.consumerKey || settings && settings.consumerKey) +
        '&redirect_uri=' + encodeURIComponent(Meteor.absoluteUrl('_oauth/salesforce')) +
        '&scope=' + flatScope + 
        '&state=' + state;

    OAuth.launchLogin({
        loginService: 'salesforce',
        loginStyle: loginStyle,
        loginUrl: loginUrl,
        credentialRequestCompleteCallback: credentialRequestCompleteCallback,
        credentialToken: credentialToken._str,
        popupOptions: {width: 475, height: 620}
    });
};

OAuth._stateParam = function(loginStyle, credentialToken, loginUrl, redirectUrl) {
    var state = {
        loginStyle: loginStyle,
        credentialToken: credentialToken,
        isCordova: Meteor.isCordova,
        loginUrl: loginUrl
    };
    if (loginStyle === 'redirect') {
        state.redirectUrl = redirectUrl || ('' + window.location);
    }
    // Encode base64 as not all login services URI-encode the state
    // parameter when they pass it back to us.
    // Use the 'base64' package here because 'btoa' isn't supported in IE8/9.
    return Base64.encode(JSON.stringify(state));
};
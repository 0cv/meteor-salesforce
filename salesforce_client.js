// Request Salesforce credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
Salesforce.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'salesforce'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError("Service not configured"));
    return;
  }

  var scope = (options && options.requestPermissions) || ['api'];
  var flatScope = scope.join(' ');
  var endPoint = (options && options.endPoint) || 'login.salesforce.com';

  //we need to be able to configure whether it's a sandbox, prod, ... but somehow, there is no way to have
  //a proper way to forward the "options" to the server hence here the weird workaround for providing the endpoint
  // to the server.
  var credentialToken = Random.id() + '__' + endPoint.replace(/\./g, '_');

  var loginUrl =
        'https://'+endPoint+'/services/oauth2/authorize' +
        '?response_type=code' + '&client_id=' + config.clientId +
        '&redirect_uri=' + encodeURIComponent(Meteor.absoluteUrl('_oauth/salesforce?close=close')) +
        '&scope=' + flatScope + '&state=' + credentialToken;

  Oauth.initiateLogin(credentialToken, loginUrl, credentialRequestCompleteCallback, {width: 900, height: 450});
};

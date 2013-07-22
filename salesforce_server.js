Salesforce.whitelistedFields = ['id', 'issued_at', 'refresh_token', 'instance_url', 'signature',
                   'access_token'];


Oauth.registerService('salesforce', 1, null, function(query) {

  var response = getTokens(query.code);
  var access_token = response.access_token;
  var identity = getIdentity(response);

  var serviceData = {
    accessToken: access_token,
   // expiresAt: (+new Date) + (1000 * response.expiresIn)
  };

  var fields = _.pick(identity, Salesforce.whitelistedFields);
  _.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refresh_token)
    serviceData.refreshToken = response.refresh_token;

  return {
    serviceData: serviceData,
    options: {profile: {name: identity.display_name}}
  };
});


// returns an object containing:
// - id:  A URL, representing the authenticated user, which can be used to access the Identity Service.
// - issued_at: The time of token issue, represented as the number of seconds since the Unix epoch (00:00:00 UTC on 1 January 1970).
// - refresh_token: A long-lived token that may be used to obtain a fresh access token on expiry of the access token in this response. See Token Refresh for more details.
// - instance_url: Identifies the Salesforce instance to which API calls should be sent.
// - signature: Base64-encoded HMAC-SHA256 signature signed with the consumer's private key containing the concatenated ID and issued_at. This can be used to verify the identity URL was not modified since it was sent by the server.
// - access_token: The short-lived access token.
var getTokens = function (authCode) {
  var config = ServiceConfiguration.configurations.findOne({service: 'salesforce'});
  if (!config)
    throw new ServiceConfiguration.ConfigError("Service not configured");

  var response;
  try {
    response = Meteor.http.post(
      "https://login.salesforce.com/services/oauth2/token", {params: {
        code: authCode,
        grant_type: 'authorization_code', 
        client_id: config.clientId,
        client_secret: config.secret,
        redirect_uri: Meteor.absoluteUrl("_oauth/salesforce?close")
      }});
  } catch (err) {
    throw new Error("Failed to complete OAuth handshake with Salesforce. " + err.message);
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Salesforce. " + response.data.error);
  } else {
    return {
      id: response.data.id,
      issued_at: response.data.issued_at,
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      instance_url: response.data.instance_url,
      signature: response.data.signature
    };
  }
};

var getIdentity = function (response) {
  try {
    return Meteor.http.get(
      response.instance_url + '/' + response.id,
      {headers: {Authorization: 'Bearer ' + response.access_token}}).data;
  } catch (err) {
    throw new Error("Failed to fetch identity from Salesforce. " + err.message);
  }
};

Salesforce.retrieveCredential = function(credentialToken) {
  return Oauth.retrieveCredential(credentialToken);
};
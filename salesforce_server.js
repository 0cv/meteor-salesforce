Oauth.registerService('salesforce', 2, null, function(query) {
    var response = getAccessToken(query);
    var access_token = response.access_token;
    var identity = getIdentity(response);

    var serviceData = {
        accessToken: access_token
    };

    var whiteListed = ['id', 'user_id', 'organization_id', 'username', 'nick_name', 'display_name', 'email', 'photos', 'urls', 'user_type', 'language', 'locale', 'utcOffset', 'last_modified_date'];

    var fields = _.pick(identity, whiteListed);
    _.extend(serviceData, fields);

    // only set the token in serviceData if it's there. this ensures
    // that we don't lose old ones (since we only get this on the first
    // log in attempt)
    if (response.refresh_token) {
        serviceData.refreshToken = response.refresh_token;
    }

    return {
        serviceData: serviceData
    };
});


// returns an object containing:
// - id:  A URL, representing the authenticated user, which can be used to access the Identity Service.
// - issued_at: The time of token issue, represented as the number of seconds since the Unix epoch (00:00:00 UTC on 1 January 1970).
// - refresh_token: A long-lived token that may be used to obtain a fresh access token on expiry of the access token in this response. See Token Refresh for more details.
// - instance_url: Identifies the Salesforce instance to which API calls should be sent.
// - signature: Base64-encoded HMAC-SHA256 signature signed with the consumer's private key containing the concatenated ID and issued_at. This can be used to verify the identity URL was not modified since it was sent by the server.
// - access_token: The short-lived access token.
var getAccessToken = function(query) {
    var config = ServiceConfiguration.configurations.findOne({
        service: 'salesforce'
    });
    var settings = Meteor.settings.salesforce;

    if (!config && !settings) {
        throw new ServiceConfiguration.ConfigError('Service not configured or settings.json missing');
    }

    var response;
    var state = OAuth._stateFromQuery(query);
    try {

        var endPoint = state.loginUrl;
        response = Meteor.http.post(
            'https://' + endPoint + '/services/oauth2/token', {
                params: {
                    code: query.code,
                    grant_type: 'authorization_code',
                    client_id: config.consumerKey || settings.consumerKey,
                    client_secret: OAuth.openSecret(config.consumerSecret || settings.consumerSecret),
                    redirect_uri: Meteor.absoluteUrl('_oauth/salesforce?close=close')
                }
            });
    } catch (err) {
        throw new Error('Failed to complete OAuth handshake with Salesforce. ' + err.message);
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error('Failed to complete OAuth handshake with Salesforce. ' + response.data.error);
    } else {
        return response.data;
    }
};

var getIdentity = function(response) {
    try {
        return Meteor.http.get(
            response.id, {
                headers: {
                    Authorization: 'Bearer ' + response.access_token
                }
            }).data;
    } catch (err) {
        throw new Error('Failed to fetch identity from Salesforce. ' + err.message);
    }
};

Salesforce.retrieveCredential = function(credentialToken, credentialSecret) {
    return Oauth.retrieveCredential(credentialToken, credentialSecret);
};
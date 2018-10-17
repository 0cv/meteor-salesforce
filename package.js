Package.describe({
    name: "salesforce:salesforce",
    summary: "Login service for Salesforce accounts",
    version: "0.2.1",
    git: "https://github.com/Krisa/meteor-salesforce.git"
});

Package.onUse(function(api) {
    api.versionsFrom('1.2.1');
    api.use('oauth', ['client', 'server']);
    api.use('oauth2', ['client', 'server']);
    api.use('base64', ['client', 'server']);
    api.use('http', ['client', 'server']);
    api.use('service-configuration', ['client', 'server']);

    api.addFiles('salesforce_common.js', ['client', 'server']);
    api.addFiles('salesforce_server.js', 'server');
    api.addFiles('salesforce_client.js', 'client');

    api.export('Salesforce');
});
Package.describe({
  summary: "Login service for Salesforce accounts"
});

Package.on_use(function(api) {
  api.use('oauth2', ['client', 'server']);
  api.use('http', ['client', 'server']);
  api.use('templating', 'client');

  api.add_files(
    ['salesforce_configure.html', 'salesforce_configure.js'],
    'client');

  api.add_files('salesforce_common.js', ['client', 'server']);
  api.add_files('salesforce_server.js', 'server');
  api.add_files('salesforce_client.js', 'client');
});

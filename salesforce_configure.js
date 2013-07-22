Template.configureLoginServiceDialogForSalesforce.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForSalesforce.fields = function () {
  return [
    {property: 'clientId', label: 'API Key'},
    {property: 'secret', label: 'Secret Key'}
  ];
};

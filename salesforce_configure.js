Template.configureLoginServiceDialogForSalesforce.siteUrl = function () {
  return Meteor.absoluteUrl();
};

Template.configureLoginServiceDialogForSalesforce.fields = function () {
  return [
    {property: 'clientId', label: 'Consumer Key'},
    {property: 'secret', label: 'Consumer Secret'}
  ];
};

import "simpler-forms";
import "./form.tsp";
using SimplerForms;
namespace Forms.PerformanceSites;

@UI.layout(PerformanceSites)
model PerformanceSitesLayout {
  @UI.label("Primary performance site")
  @doc("Identify the primary location where work will be performed. Organization details do not apply when submitting as an individual.")
  primary: {
    primarySite: PerformanceSites.primarySite;
  };

  @UI.label("Additional performance sites")
  @doc("Add each other site separately. Address and congressional-district rules apply to that site's country. The overflow reference is available at 299 additional sites or while a reference is already present.")
  additional: {
    additionalSites: PerformanceSites.additionalSites;
    additionalLocationsAttachment: PerformanceSites.additionalLocationsAttachment;
  };
}

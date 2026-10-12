// The JS that implements the `extern dec` declarations below.
import "../dist/src/index.js";

using TypeSpec.Reflection;

/** What Grants.gov's XML transform rules need about an XSD TypeSpec model that `@typespec/xml` does not say. */
namespace GrantsGov;

/** The URL of the XSD this root element is declared in. */
extern dec xsd(target: Model, url: valueof string);

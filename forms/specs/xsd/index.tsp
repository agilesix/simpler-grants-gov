// Mirrors of the Grants.gov XSDs the forms are submitted as, for `@Mapping.to` to link into.
//
// One namespace per XSD, each with an `@Xml.nsDeclarations` enum that mirrors the XSD's own
// `xmlns:` declarations. Every XSD here sets `elementFormDefault="qualified"`, so an element
// is in the namespace of the schema that declares it: each model carries that namespace with
// `@Xml.ns`, and its properties take it from the model. Properties are declared in the XSD's
// sequence order, which is the order the elements are written in.
//
// Only the structure is mirrored. Facets (lengths, patterns, code lists) stay in the XSD,
// where the parity suite compares them against the JSON schema.
import "./global-library.tsp";
import "./key-contacts-2-0.tsp";

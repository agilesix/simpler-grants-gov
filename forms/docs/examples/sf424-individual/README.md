# SF-424 Individual: retained-region reproduction

Synthetic local library evidence, captured on `7343dce618421274a5ba52761e0f26446bcfb22b`. The definition at `f7a66ce57efb00e18d73ab4434f8728d735412d4` changes only source-plan risk prose after that capture; runtime UI and mapping are unchanged.

1. Load the US sample, retaining Maryland.
2. Change Country to Uruguay; enter Province Montevideo.
3. Inspect Data and XML: the retained State and Province both appear. The original GlobalLibrary XSD rejects Province after State.
4. Clear State through the UI: the matched control XML passes the original XSD.

The files preserve both outcomes; the failed output is intentional evidence, not a valid sample submission. No mapper or answer-clearing change is included. This relates to HHS/simpler-grants-gov#12975 and the State/Province review on12910. Definition review and API submission readiness remain separate.

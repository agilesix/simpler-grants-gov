"""Generated Individual mapping through the maintained XML consumer and source XSD."""

from copy import deepcopy
from pathlib import Path

import pytest
from lxml import etree

from src.form_schema.forms.sf424_individual_generated import (
    FORM_JSON_SCHEMA,
    FORM_XML_TRANSFORM_RULES,
)
from src.services.xml_generation.models import XMLGenerationRequest
from src.services.xml_generation.service import XMLGenerationService
from src.services.xml_generation.validation.xsd_validator import XSDValidator

_NS = "http://apply.grants.gov/forms/SF424_Individual_2_0-V2.0"
_XSDS = Path(__file__).parents[4] / "src/services/xml_generation/xsds"


def generate(data):
    result = XMLGenerationService().generate_xml(
        XMLGenerationRequest(application_data=data, transform_config=FORM_XML_TRANSFORM_RULES)
    )
    assert result.success, result.error_message
    return result.xml_data


def validate(xml):
    return XSDValidator(_XSDS).validate_xml(xml, _XSDS / "SF424_Individual_2_0-V2.0.xsd")


@pytest.mark.parametrize("index", [0, 1])
def test_complete_source_samples(index):
    data = deepcopy(FORM_JSON_SCHEMA["examples"][index])
    data["project"]["description"] = "Archives & <records>\n第二行"
    xml = generate(data)
    root = etree.fromstring(xml.encode())
    assert root.tag == f"{{{_NS}}}SF424_Individual_2_0"
    assert root.get(f"{{{_NS}}}FormVersion") == "2.0"
    assert root.find(f"{{{_NS}}}ProjectDescription").text == data["project"]["description"]
    assert root.find(f"{{{_NS}}}citizenship").text == (
        "Y: Yes" if data["applicant"]["citizenship"]["is_us_citizen"] else "N: No"
    )
    result = validate(xml)
    assert result["valid"], result


@pytest.mark.parametrize(
    "field", ["date_received", "certification.signature", "certification.date_signed"]
)
def test_unsigned_draft_is_not_submission_complete(field):
    data = deepcopy(FORM_JSON_SCHEMA["examples"][0])
    target = data
    path = field.split(".")
    for key in path[:-1]:
        target = target[key]
    del target[path[-1]]
    assert not validate(generate(data))["valid"]


def test_source_rejects_mutated_required_element_and_order():
    root = etree.fromstring(generate(FORM_JSON_SCHEMA["examples"][0]).encode())
    root[0].tag = f"{{{_NS}}}UnexpectedAgency"
    assert not validate(etree.tostring(root, encoding="unicode"))["valid"]
    root = etree.fromstring(generate(FORM_JSON_SCHEMA["examples"][0]).encode())
    root.insert(1, root[-1])
    assert not validate(etree.tostring(root, encoding="unicode"))["valid"]

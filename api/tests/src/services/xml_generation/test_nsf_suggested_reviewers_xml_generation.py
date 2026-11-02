"""Exercise actual XML output, including asymmetric answers and source rejection."""

from pathlib import Path

import pytest
from lxml import etree

from src.form_schema.forms.nsf_suggested_reviewers_generated import FORM_XML_TRANSFORM_RULES
from src.services.xml_generation.models import XMLGenerationRequest
from src.services.xml_generation.service import XMLGenerationService
from src.services.xml_generation.validation.xsd_validator import XSDValidator

_NS = "http://apply.grants.gov/forms/NSF_SuggestedReviewers-V1.1"
_XSDS = Path(__file__).parents[4] / "src/services/xml_generation/xsds"
_FIELDS = {
    "suggested_reviewers": "SuggestedReviewers",
    "reviewers_not_to_include": "ReviewersNotToInclude",
}


def generate(data):
    response = XMLGenerationService().generate_xml(
        XMLGenerationRequest(application_data=data, transform_config=FORM_XML_TRANSFORM_RULES)
    )
    assert response.success, response.error_message
    return response.xml_data


@pytest.mark.parametrize(
    "data",
    [
        {},
        {"suggested_reviewers": "Suggested only"},
        {"reviewers_not_to_include": "Excluded only"},
        {"suggested_reviewers": "x" * 4000, "reviewers_not_to_include": "y" * 4000},
        {
            "suggested_reviewers": "Dr. Élise & <scope>\n第二行",
            "reviewers_not_to_include": "Different answer",
        },
    ],
)
def test_source_valid_output_preserves_each_answer_and_order(data):
    xml = generate(data)
    root = etree.fromstring(xml.encode())
    assert root.tag == f"{{{_NS}}}NSF_SuggestedReviewers"
    assert root.get(f"{{{_NS}}}FormVersion") == "1.1"
    assert [etree.QName(child).localname for child in root] == [
        element for field, element in _FIELDS.items() if field in data
    ]
    for field, element in _FIELDS.items():
        answer = root.find(f"{{{_NS}}}{element}")
        if field in data:
            assert answer is not None
            assert answer.text == data[field]
        else:
            assert answer is None
    result = XSDValidator(_XSDS).validate_xml(xml, _XSDS / "NSF_SuggestedReviewers-V1.1.xsd")
    assert result["valid"], result


@pytest.mark.parametrize("field", list(_FIELDS))
@pytest.mark.parametrize("value", ["", "x" * 4001])
def test_original_xsd_rejects_present_empty_or_overlong_answer(field, value):
    xml = generate({field: value})
    if value == "":
        # The serializer omits empty strings; the original schema independently rejects
        # a present-empty witness. JSON-schema validation guards the API answer itself.
        root = etree.fromstring(xml.encode())
        etree.SubElement(root, f"{{{_NS}}}{_FIELDS[field]}")
        xml = etree.tostring(root, encoding="unicode")
    result = XSDValidator(_XSDS).validate_xml(xml, _XSDS / "NSF_SuggestedReviewers-V1.1.xsd")
    assert not result["valid"]


def test_snapshot():
    assert (
        generate(
            {
                "suggested_reviewers": "Suggested & <scope>.",
                "reviewers_not_to_include": "Excluded reviewer.",
            }
        )
        == (Path(__file__).parent / "snapshots/nsf_suggested_reviewers_1_1.xml").read_text()
    )

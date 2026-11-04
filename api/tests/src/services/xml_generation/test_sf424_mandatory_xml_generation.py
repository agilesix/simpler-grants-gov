"""Mandatory source XML through the maintained consumer, including both attachment shapes."""

from copy import deepcopy
from pathlib import Path
from uuid import uuid4

import pytest
from lxml import etree

from src.form_schema.forms.sf424_mandatory_generated import (
    FORM_JSON_SCHEMA,
    FORM_RULE_SCHEMA,
    FORM_XML_TRANSFORM_RULES,
)
from src.form_schema.rule_processing.json_rule_processor import process_rule_schema_for_context
from src.services.xml_generation.models import XMLGenerationRequest
from src.services.xml_generation.service import XMLGenerationService
from src.services.xml_generation.utils.attachment_mapping import AttachmentInfo
from src.services.xml_generation.validation.xsd_validator import XSDValidator
from tests.src.form_schema.rule_processing.conftest import setup_context

_NS = "http://apply.grants.gov/forms/SF424_Mandatory_3_0-V3.0"
_ATT = "http://apply.grants.gov/system/Attachments-V1.0"
_XSDS = Path(__file__).parents[4] / "src/services/xml_generation/xsds"


def generate(data):
    ids = data.get("attachments", []) + (
        [data["congressional_districts"]["additional_attachment"]]
        if "additional_attachment" in data["congressional_districts"]
        else []
    )
    files = {
        key: AttachmentInfo(
            filename=f"{key}.pdf",
            mime_type="application/pdf",
            file_location=f"./attachments/{key}.pdf",
            hash_value="YQ==",
        )
        for key in ids
    }
    result = XMLGenerationService().generate_xml(
        XMLGenerationRequest(
            application_data=data,
            transform_config=FORM_XML_TRANSFORM_RULES,
            attachment_mapping=files,
        )
    )
    assert result.success, result.error_message
    return etree.fromstring(result.xml_data.encode())


def validate(root):
    return XSDValidator(_XSDS).validate_xml(
        etree.tostring(root, encoding="unicode"), _XSDS / "SF424_Mandatory_3_0-V3.0.xsd"
    )


def text(root, local):
    return root.findtext(f"{{{_NS}}}{local}")


def test_complete_source_sample():
    root = generate(
        deepcopy(
            next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
        )
    )
    assert root.tag == f"{{{_NS}}}SF424_Mandatory_3_0"
    assert root.get(f"{{{_NS}}}FormVersion") == "3.0"
    assert text(root, "TypeOfSubmission") == "Other"
    assert text(root, "ConsolidatedRequest") == "Y: Yes"
    assert text(root, "DelinquentOnFederalDebt") == "Y: Yes"
    assert text(root, "ApplicationCertification") == "Y: Yes"
    assert text(root, "EstimatedFundingFederal") == "12345.67"
    assert text(root, "EstimatedFundingMatch") == "0"
    assert text(root, "ContactEmail") == "alicia.reyes@example.org"
    assert text(root, "AuthorizedRepresentativeEmail") == "priya.patel@example.org"
    assert validate(root)["valid"], validate(root)


@pytest.mark.parametrize("count", [0, 1, 100])
def test_supporting_files_and_single_district_attachment_are_distinct(count):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    data["attachments"] = [f"00000000-0000-4000-8000-{i:012d}" for i in range(count)]
    root = generate(data)
    files = root.findall(f"{{{_NS}}}attachments/{{{_ATT}}}AttachedFile/{{{_ATT}}}FileName")
    assert [f.text for f in files] == [f"{key}.pdf" for key in data["attachments"]]
    district = root.find(f"{{{_NS}}}AdditionalCongressionalDistricts/{{{_ATT}}}FileName")
    assert district.text == f"{data['congressional_districts']['additional_attachment']}.pdf"
    assert validate(root)["valid"], validate(root)


def test_false_and_foreign_address_values():
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    data["submission"]["consolidated_request"] = False
    data["debt"]["is_delinquent"] = False
    address = data["applicant"]["address"]
    address.pop("state")
    address.update(country="CAN: CANADA", province="Ontario", zip_code="K1A 0B1")
    root = generate(data)
    assert text(root, "ConsolidatedRequest") == "N: No"
    assert text(root, "DelinquentOnFederalDebt") == "N: No"
    assert root.xpath("//*[local-name()='Province']/text()") == ["Ontario"]
    assert root.xpath("//*[local-name()='State']") == []
    assert validate(root)["valid"], validate(root)


@pytest.mark.parametrize(
    "path",
    [
        "dates.received_date",
        "authorized_representative.signature",
        "authorized_representative.date_signed",
    ],
)
def test_draft_missing_submission_value_is_not_final_xml(path):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    keys = path.split(".")
    del data[keys[0]][keys[1]]
    assert not validate(generate(data))["valid"]


def test_xsd_rejects_missing_required_element_wrong_order_and_excess_files():
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    root = generate(data)
    root.remove(root.find(f"{{{_NS}}}DescriptiveProjectTitle"))
    assert not validate(root)["valid"]
    root = generate(data)
    root.insert(0, root[-1])
    assert not validate(root)["valid"]
    data["attachments"] = [f"00000000-0000-4000-8000-{i:012d}" for i in range(101)]
    assert not validate(generate(data))["valid"]


def test_all_populated_leaf_values_against_source_positions():
    """Literal expectations reviewed against the F712 DAT and original XSD, not the mapping."""
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    root = generate(data)
    expected = {
        "TypeOfSubmission": "Other",
        "TypeOfSubmissionOtherDescription": "Synthetic formula grant request",
        "Frequency": "Other",
        "FrequencyOtherDescription": "Semiannual",
        "ConsolidatedRequest": "Y: Yes",
        "ConsolidatedRequestExplanation": "Synthetic consolidated submission for two community programs.",
        "Version": "Initial",
        "ReceivedDate": "2026-11-03",
        "ApplicantID": "SYN-APPLICANT-01",
        "FederalEntityID": "SYN-ENTITY-01",
        "FederalAwardID": "SYN-AWARD-01",
        "StateReceivedDate": "2026-10-29",
        "StateApplicationID": "SYN-STATE-01",
        "Organization/OrganizationName": "Example Community Organization",
        "Organization/SAMUEI": "SYNTHETIC001",
        "Organization/DepartmentName": "Community Programs",
        "Organization/DivisionName": "Education",
        "Organization/Address/Street1": "100 Grant Avenue",
        "Organization/Address/Street2": "Suite 400",
        "Organization/Address/City": "Baltimore",
        "Organization/Address/County": "Baltimore City",
        "Organization/Address/State": "MD: Maryland",
        "Organization/Address/ZipPostalCode": "21218-1234",
        "Organization/Address/Country": "USA: UNITED STATES",
        "Organization/EIN": "12-3456789",
        "ContactName/PrefixName": "Dr.",
        "ContactName/FirstName": "Alicia",
        "ContactName/MiddleName": "Marie",
        "ContactName/LastName": "Reyes",
        "ContactName/SuffixName": "PhD",
        "ContactTitle": "Program Director",
        "ContactOrganizationalAffiliation": "Example Community Organization",
        "ContactPhoneNumber": "4105550100",
        "ContactFax": "4105550199",
        "ContactEmail": "alicia.reyes@example.org",
        "ApplicantType": "X: Other (specify)",
        "OtherTypeApplicant": "Synthetic community partnership",
        "AdditionalApplicantTypeDescription": "Educational community organization",
        "AgencyName": "Department of Education",
        "CFDANumber": "84.027",
        "CFDATitle": "Synthetic Education Program",
        "DescriptiveProjectTitle": "Community Learning Program",
        "AreasAffectedByFunding": "Baltimore City",
        "CongressionalDistrictApplicant": "MD-007",
        "CongressionalDistrictProject": "MD-007",
        "FundingPeriodStartDate": "2027-01-01",
        "FundingPeriodEndDate": "2027-12-31",
        "EstimatedFundingFederal": "12345.67",
        "EstimatedFundingMatch": "0",
        "SubmissionUnderReview": "StateReviewAvailable",
        "StateReviewAvailableDate": "2026-10-28",
        "DelinquentOnFederalDebt": "Y: Yes",
        "DelinquentFederalDebtExplanation": "Synthetic debt explanation for exercising the conditional question.",
        "ApplicationCertification": "Y: Yes",
        "AuthorizedRepresentativeName/PrefixName": "Ms.",
        "AuthorizedRepresentativeName/FirstName": "Priya",
        "AuthorizedRepresentativeName/MiddleName": "K",
        "AuthorizedRepresentativeName/LastName": "Patel",
        "AuthorizedRepresentativeName/SuffixName": "Jr.",
        "AuthorizedRepresentativeTitle": "Executive Director",
        "AuthorizedRepresentativeOrganizationalAffiliation": "Example Community Organization",
        "AuthorizedRepresentativePhoneNumber": "4105550101",
        "AuthorizedRepresentativeFax": "4105550198",
        "AuthorizedRepresentativeEmail": "priya.patel@example.org",
        "AuthorizedRepresentativeSignature": "Priya Patel",
        "AuthorizedRepresentativeSignatureDate": "2026-11-03",
    }
    for path, value in expected.items():
        xpath = "./" + "/".join(f"*[local-name()='{part}']" for part in path.split("/"))
        found = root.xpath(xpath)
        assert len(found) == 1, path
        assert found[0].text == value, path
    # Two logical attachment questions expand to transport metadata. Check every file's metadata.
    files = root.xpath("//*[local-name()='FileName']")
    assert [f.text for f in files] == [
        "00000000-0000-4000-8000-000000007121.pdf",
        "00000000-0000-4000-8000-000000007122.pdf",
        "00000000-0000-4000-8000-000000007123.pdf",
    ]
    for filename in files:
        parent = filename.getparent()
        assert parent.findtext(f"{{{_ATT}}}MimeType") == "application/pdf"
        assert (
            parent.find(f"{{{_ATT}}}FileLocation").get(f"{{{_ATT}}}href")
            == f"./attachments/{filename.text}"
        )
        digest = parent.find("{http://apply.grants.gov/system/Global-V1.0}HashValue")
        assert digest.text == "YQ=="
        assert digest.get("{http://apply.grants.gov/system/Global-V1.0}hashAlgorithm") == "SHA-1"


def test_minimum_draft_requires_actual_post_population_before_final_xml(enable_factory_create):
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Application")
    )
    context = setup_context(
        data,
        FORM_RULE_SCHEMA,
        do_post_population=False,
        has_organization=True,
        uei=uuid4().hex[:12].upper(),
        agency_name="Synthetic Agency",
        user_email="signer@example.org",
    )
    process_rule_schema_for_context(context)
    assert not validate(generate(context.json_data))["valid"]
    context.config.do_post_population = True
    process_rule_schema_for_context(context)
    result = validate(generate(context.json_data))
    assert result["valid"], result

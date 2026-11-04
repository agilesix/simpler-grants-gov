"""Real PUT/GET preserves typed answers, inactive answers and date validation."""

from copy import deepcopy

from src.constants.lookup_constants import ApplicationFormStatus, Privilege
from src.form_schema.forms.sf424_mandatory_generated import FORM, FORM_JSON_SCHEMA
from tests.lib.application_test_utils import create_user_in_app
from tests.src.db.models.factories import (
    ApplicationAttachmentFactory,
    ApplicationFormFactory,
    CompetitionFormFactory,
)


def test_save_reload_transitions(client, enable_factory_create, seed_form_registry, db_session):
    _, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION, Privilege.VIEW_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    af = ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    url = f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}"
    headers = {"X-SGG-Token": token}
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Application")
    )
    data["project"]["title"] = "true"
    data["identifiers"] = {"applicant_id": "null", "state_application_id": "0"}
    data["debt"] = {"is_delinquent": True, "explanation": "Retain this explanation"}
    scenarios = [
        (True, "2027-12-31", False),
        (False, "2027-12-31", False),
        (True, "2026-12-31", True),
        (True, "2027-01-01", False),
    ]
    for delinquent, end_date, invalid in scenarios:
        data["debt"]["is_delinquent"] = delinquent
        data["funding"]["end_date"] = end_date
        response = client.put(url, headers=headers, json={"application_response": data})
        assert response.status_code == 200
        assert any(w["type"] == "invalid_date_order" for w in response.json["warnings"]) == invalid
        db_session.refresh(af)
        saved = af.application_response
        assert saved["project"] == data["project"]
        assert saved["identifiers"] == data["identifiers"]
        assert saved["debt"] == data["debt"]
        assert saved["funding"] == data["funding"]
        assert "dates" not in saved
        assert "signature" not in saved["authorized_representative"]
        assert response.json["data"]["application_form_status"] == (
            ApplicationFormStatus.IN_PROGRESS if invalid else ApplicationFormStatus.COMPLETE
        )
        reloaded = client.get(
            f"/alpha/applications/{application.application_id}/application_form/{af.application_form_id}",
            headers=headers,
        )
        assert reloaded.status_code == 200
        assert reloaded.json["data"]["application_response"] == saved
    del data["debt"]["explanation"]
    response = client.put(url, headers=headers, json={"application_response": data})
    assert response.status_code == 200
    assert response.json["warnings"]
    assert response.json["data"]["application_form_status"] == ApplicationFormStatus.IN_PROGRESS


def test_full_draft_save_reload_with_application_owned_attachments(
    client, enable_factory_create, seed_form_registry, db_session
):
    _, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION, Privilege.VIEW_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    af = ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    data = deepcopy(
        next(e for e in FORM_JSON_SCHEMA["examples"] if e["submission"]["type"] == "Other")
    )
    del data["dates"]["received_date"]
    del data["authorized_representative"]["signature"]
    del data["authorized_representative"]["date_signed"]
    # Allocate database identities; sample IDs may already exist in another test context.
    files = [ApplicationAttachmentFactory.create(application=application) for _ in range(3)]
    data["congressional_districts"]["additional_attachment"] = str(
        files[0].application_attachment_id
    )
    data["attachments"] = [str(file.application_attachment_id) for file in files[1:]]
    headers = {"X-SGG-Token": token}
    result = client.put(
        f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}",
        headers=headers,
        json={"application_response": data},
    )
    assert result.status_code == 200
    assert result.json["warnings"] == []
    assert result.json["data"]["application_form_status"] == ApplicationFormStatus.COMPLETE
    db_session.refresh(af)
    saved = af.application_response
    # The population-provider test owns the four authoritative prefilled values.
    for key in data:
        if key not in ("opportunity", "applicant"):
            assert saved[key] == data[key], key
    assert {k: v for k, v in saved["applicant"].items() if k != "uei"} == {
        k: v for k, v in data["applicant"].items() if k != "uei"
    }
    reloaded = client.get(
        f"/alpha/applications/{application.application_id}/application_form/{af.application_form_id}",
        headers=headers,
    )
    assert reloaded.status_code == 200
    assert reloaded.json["data"]["application_response"] == saved

"""Actual save/reload preserves typed answers and executes the emitted date rule."""

from copy import deepcopy

from src.constants.lookup_constants import ApplicationFormStatus, Privilege
from src.form_schema.forms.sf424_individual_generated import FORM, FORM_JSON_SCHEMA
from tests.lib.application_test_utils import create_user_in_app
from tests.src.db.models.factories import ApplicationFormFactory, CompetitionFormFactory


def test_save_reload_and_validation(client, enable_factory_create, seed_form_registry, db_session):
    _, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION, Privilege.VIEW_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    af = ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    url = f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}"
    headers = {"X-SGG-Token": token}
    data = deepcopy(FORM_JSON_SCHEMA["examples"][0])
    data.pop("date_received")
    data["certification"].pop("signature")
    data["certification"].pop("date_signed")
    data["project"]["title"] = "true"
    data["project"]["description"] = "null"
    data["applicant"]["citizenship"] = {
        "is_us_citizen": False,
        "country_of_citizenship": "URY: URUGUAY",
        "residency_start_date": "2025-01-15",
    }
    for end_date, invalid in [("2027-12-31", False), ("2026-12-31", True), ("2027-01-01", False)]:
        data["project"]["end_date"] = end_date
        response = client.put(url, headers=headers, json={"application_response": data})
        assert response.status_code == 200
        warnings = response.json["warnings"]
        assert any(w["type"] == "invalid_date_order" for w in warnings) == invalid
        db_session.refresh(af)
        saved = af.application_response
        assert saved["applicant"] == data["applicant"]
        assert saved["project"] == data["project"]
        assert "date_received" not in saved
        assert "signature" not in saved["certification"]
        assert response.json["data"]["application_form_status"] == (
            ApplicationFormStatus.IN_PROGRESS if warnings else ApplicationFormStatus.COMPLETE
        )
        reloaded = client.get(
            f"/alpha/applications/{application.application_id}/application_form/{af.application_form_id}",
            headers=headers,
        )
        assert reloaded.status_code == 200
        assert reloaded.json["data"]["application_response"] == saved

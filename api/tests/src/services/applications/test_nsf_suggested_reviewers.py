"""Actual save validation and persistence keep the two purposes independent."""

from src.constants.lookup_constants import ApplicationFormStatus, Privilege
from src.form_schema.forms.nsf_suggested_reviewers_generated import FORM
from tests.lib.application_test_utils import create_user_in_app
from tests.src.db.models.factories import ApplicationFormFactory, CompetitionFormFactory


def test_save_clear_and_validation(client, enable_factory_create, seed_form_registry, db_session):
    _, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION, Privilege.VIEW_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    af = ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    url = f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}"
    headers = {"X-SGG-Token": token}
    for data, invalid in [
        ({}, False),
        ({"suggested_reviewers": "Suggested & <scope>\nSecond line"}, False),
        ({"suggested_reviewers": "Suggested", "reviewers_not_to_include": "Excluded"}, False),
        ({"reviewers_not_to_include": "Excluded"}, False),
        ({"suggested_reviewers": "x" * 4000, "reviewers_not_to_include": "y" * 4000}, False),
        ({"suggested_reviewers": "", "reviewers_not_to_include": "Retained"}, True),
        ({"suggested_reviewers": "Retained", "reviewers_not_to_include": "x" * 4001}, True),
        ({}, False),
    ]:
        response = client.put(url, headers=headers, json={"application_response": data})
        assert response.status_code == 200
        db_session.refresh(af)
        assert af.application_response == data
        assert bool(response.json["warnings"]) == invalid
        assert response.json["data"]["application_form_status"] == (
            ApplicationFormStatus.IN_PROGRESS if invalid else ApplicationFormStatus.COMPLETE
        )
        reloaded = client.get(
            f"/alpha/applications/{application.application_id}/application_form/{af.application_form_id}",
            headers=headers,
        )
        assert reloaded.status_code == 200
        assert reloaded.json["data"]["application_response"] == data

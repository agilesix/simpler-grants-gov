"""PHS upload ownership and clear/remove behavior at the real API boundary."""

import pytest
from sqlalchemy import select

from src.constants.lookup_constants import ApplicationAuditEvent, ApplicationFormStatus, Privilege
from src.db.models.competition_models import ApplicationAudit
from src.form_schema.forms.phs_398_research_plan_generated import FORM
from tests.lib.application_test_utils import create_user_in_app
from tests.src.db.models.factories import (
    ApplicationAttachmentFactory,
    ApplicationFormFactory,
    CompetitionFormFactory,
)


@pytest.mark.parametrize(
    "field,array", [("research_strategy", False), ("specific_aims", False), ("appendix", True)]
)
def test_upload_save_remove_and_audit(
    client, enable_factory_create, seed_form_registry, db_session, field, array, s3_config
):
    user, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    af = ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    strategy = ApplicationAttachmentFactory.create(application=application, user=user)
    target = (
        strategy
        if field == "research_strategy"
        else ApplicationAttachmentFactory.create(application=application, user=user)
    )
    kept = (
        ApplicationAttachmentFactory.create(application=application, user=user) if array else None
    )
    value = str(target.application_attachment_id)
    initial = {
        "research_strategy": str(strategy.application_attachment_id),
        field: [value, str(kept.application_attachment_id)] if array else value,
    }
    url = f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}"
    headers = {"X-SGG-Token": token}
    response = client.put(url, headers=headers, json={"application_response": initial})
    assert response.status_code == 200
    assert response.json["warnings"] == []
    db_session.refresh(af)
    assert af.application_response == initial
    updated = {"research_strategy": str(strategy.application_attachment_id)}
    if array:
        updated[field] = [str(kept.application_attachment_id)]
    elif field == "research_strategy":
        updated = {}
    response = client.put(url, headers=headers, json={"application_response": updated})
    assert response.status_code == 200
    db_session.refresh(af)
    assert af.application_response == updated
    assert response.json["data"]["application_form_status"] == (
        ApplicationFormStatus.IN_PROGRESS
        if field == "research_strategy"
        else ApplicationFormStatus.COMPLETE
    )
    db_session.refresh(target)
    assert target.is_deleted
    assert target.file_location == "DELETED"
    if kept:
        db_session.refresh(kept)
        assert not kept.is_deleted
    audits = db_session.scalars(
        select(ApplicationAudit).where(
            ApplicationAudit.target_attachment_id == target.application_attachment_id
        )
    ).all()
    assert {a.application_audit_event for a in audits} == {
        ApplicationAuditEvent.ATTACHMENT_ADDED,
        ApplicationAuditEvent.ATTACHMENT_DELETED,
    }


@pytest.mark.parametrize("field,array", [("research_strategy", False), ("appendix", True)])
def test_foreign_upload_cannot_complete(
    client, enable_factory_create, seed_form_registry, db_session, field, array
):
    user, application, token = create_user_in_app(
        db_session, privileges=[Privilege.MODIFY_APPLICATION]
    )
    cf = CompetitionFormFactory.create(competition=application.competition, form=FORM)
    ApplicationFormFactory.create(
        application=application, competition_form=cf, application_response={}
    )
    own = ApplicationAttachmentFactory.create(application=application, user=user)
    foreign = ApplicationAttachmentFactory.create()
    value = str(foreign.application_attachment_id)
    data = {
        "research_strategy": str(own.application_attachment_id),
        field: [value] if array else value,
    }
    response = client.put(
        f"/alpha/applications/{application.application_id}/forms/{FORM.form_id}",
        headers={"X-SGG-Token": token},
        json={"application_response": data},
    )
    assert response.status_code == 200
    assert response.json["data"]["application_form_status"] == ApplicationFormStatus.IN_PROGRESS
    assert [w["type"] for w in response.json["warnings"]] == ["unknown_application_attachment"]
    db_session.refresh(foreign)
    assert not foreign.is_deleted

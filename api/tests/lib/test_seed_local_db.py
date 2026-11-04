import inspect
import uuid

import tests.src.db.models.factories as factories
from src.db.models.opportunity_models import Opportunity
from src.form_schema.forms import SF424Individual_v2_0
from tests.lib.seed_local_db import SeedConfig, run_seed_logic


def test_run_seed_logic_can_run_multiple_times(db_session, enable_factory_create):
    # A few times when modifying our seed script we've modified it
    # in a way that if you run it multiple times, it breaks
    config = SeedConfig(
        iterations=1,
        cover_all_agencies=True,
        seed_agencies=True,
        seed_opportunities=True,
        seed_forms=True,
        seed_users=True,
        seed_e2e=True,
        seed_award_recommendations=True,
        seed_award_recommendation_workflows=False,
    )
    run_seed_logic(db_session, config)

    opportunity = db_session.get(Opportunity, uuid.UUID("79d20cef-63a6-4d6f-84a1-78c81f2c0603"))
    assert opportunity is not None
    assert len(opportunity.competitions) == 1
    competition = opportunity.competitions[0]
    assert competition.is_simpler_grants_enabled
    assert len(competition.competition_forms) == 1
    assert competition.competition_forms[0].form_id == SF424Individual_v2_0.form_id
    assert competition.competition_forms[0].is_required

    # The most common reason we hit issues with rerunning the seed script
    # is relying on a factory sequence that starts from 0 each time populating
    # a unique column. So, between runs, reset the sequence on all factories.
    factory_members = inspect.getmembers(factories)
    for _, obj in factory_members:
        if inspect.isclass(obj) and issubclass(obj, factories.BaseFactory):
            obj.reset_sequence()

    run_seed_logic(db_session, config)

    db_session.expire(opportunity, ["competitions"])
    assert len(opportunity.competitions) == 1

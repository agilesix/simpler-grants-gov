import "simpler-forms";
import "../index.tsp";
import "./title.tsp";

using SimplerForms;

namespace Questions.People;

/** A contact person's position. */
@Meta.question(#{ id: "person/role" })
@Meta.tag(TagName.person, TagName.role)
@UI.label("Role")
model PersonRole {
  /** Enter the contact's position title. */
  @UI.label("Title")
  title?: Questions.People.ContactTitle;
}

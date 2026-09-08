import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";
import "./_types.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Application;

/** Enter the date the application is submitted to the Federal agency or State. */
@Meta.question(#{ id: "application/submission-date-entered", entity: EntityName.application })
@Meta.role(ResponseRole.applicantInput)
@Meta.tag(TagName.date)
@UI.label("Date Submitted")
scalar ApplicantEnteredSubmissionDate extends plainDate;

import "simpler-forms";
import "../index.tsp";
import "../generics/index.tsp";

using SimplerForms;
using QuestionBank.Generics;

namespace QuestionBank.Project;

/**
 * A congressional district, as a two-character state abbreviation and a three-character
 * district number: `CA-005`.
 */
@Meta.question(#{ id: "project/congressional-district", entity: EntityName.project })
@Meta.tag(TagName.identifier)
@minLength(1)
@maxLength(6)
scalar CongressionalDistrict extends string;

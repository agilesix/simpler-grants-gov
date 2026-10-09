import { describe, expect, it } from "vitest";

import {
  planFields,
  readConstraints,
  readRequired,
  type Plan,
} from "./plan.ts";

const kinds = (found: { kind: string; path: string }[]) =>
  found.map((d) => `${d.kind}: ${d.path}`);

describe("readRequired", () => {
  it.each([
    [true, "yes"],
    [false, "no"],
    ["No (per XSD; required when section is started)", "no"],
    ["Conditional (when Country = 'USA')", "conditional"],
    ["Sometimes", undefined],
  ] as const)("reads %j as %s", (text, expected) => {
    expect(readRequired(text)).toBe(expected);
  });
});

describe("readConstraints", () => {
  it("reads numeric bounds", () => {
    expect(readConstraints("minLength 1, maxLength 10")).toEqual({
      minLength: 1,
      maxLength: 10,
    });
  });

  it("reads enumeration type names", () => {
    expect(readConstraints("StateCodeDataType enumeration")).toEqual({
      enumType: "StateCodeDataType",
    });
  });

  it("refuses unreadable text", () => {
    expect(readConstraints("max 10 chars")).toBeUndefined();
  });
});

describe("planFields", () => {
  const plan: Plan = {
    slug: "test",
    sections: [
      {
        title: "Section",
        fields: [
          {
            label: "First Name",
            dat_field: "7-04",
            required: true,
            constraints: "maxLength 35",
            json_path: "name.first_name",
            xml_path: "Form:ContactName/globLib:FirstName",
          },
          {
            label: "Odd",
            required: "Maybe",
            json_path: "odd",
            constraints: "short",
          },
        ],
      },
    ],
  };

  it("keys fields by chosen plan attribute", () => {
    expect([...planFields(plan, "xml_path").keys()]).toEqual([
      "ContactName/FirstName",
    ]);
  });

  it("flags unreadable requiredness and constraints", () => {
    const problems: { kind: string; path: string }[] = [];
    planFields(plan, "json_path", problems);
    expect(kinds(problems)).toEqual([
      "required unreadable: odd",
      "constraints unreadable: odd",
    ]);
  });

  describe("max_occurs", () => {
    const repeating: Plan = {
      slug: "test",
      sections: [
        {
          title: "Single",
          fields: [{ label: "Name", required: true, json_path: "name" }],
        },
        {
          title: "Contacts",
          max_occurs: 4,
          fields: [
            { label: "Role", required: true, json_path: "contacts[].role" },
            {
              label: "Attachment",
              required: false,
              json_path: "contacts[].files[]",
              max_occurs: "unbounded",
            },
          ],
        },
      ],
    };
    const occurs = (path: string) =>
      planFields(repeating, "json_path").get(path)?.rules.maxOccurs;

    it("defaults to 1", () => {
      expect(occurs("name")).toBe(1);
    });

    it("inherits from section", () => {
      expect(occurs("contacts[].role")).toBe(4);
    });

    it("lets field override section", () => {
      expect(occurs("contacts[].files[]")).toBe("unbounded");
    });
  });
});

import { describe, expect, it } from "vitest";

import { AnswerAcceptanceError, selectAcceptedAnswer } from "./acceptance";

describe("accepted answer selection", () => {
  it("selects exactly one answer", () => {
    const answers = selectAcceptedAnswer(["a", "b", "c"], "b");

    expect(answers.filter((answer) => answer.isAccepted)).toEqual([
      { id: "b", isAccepted: true },
    ]);
  });

  it("rejects an answer from another question", () => {
    expect(() => selectAcceptedAnswer(["a", "b"], "other")).toThrow(
      AnswerAcceptanceError,
    );
  });

  it("rejects ambiguous duplicate identifiers", () => {
    expect(() => selectAcceptedAnswer(["a", "a"], "a")).toThrow(
      "Answer identifiers must be unique.",
    );
  });
});

export class AnswerAcceptanceError extends Error {}

export function selectAcceptedAnswer(
  answerIds: readonly string[],
  requestedAnswerId: string,
) {
  const uniqueAnswerIds = new Set(answerIds);
  if (uniqueAnswerIds.size !== answerIds.length) {
    throw new AnswerAcceptanceError("Answer identifiers must be unique.");
  }
  if (!uniqueAnswerIds.has(requestedAnswerId)) {
    throw new AnswerAcceptanceError(
      "The accepted answer must belong to this question.",
    );
  }
  return answerIds.map((id) => ({ id, isAccepted: id === requestedAnswerId }));
}

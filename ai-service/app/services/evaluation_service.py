import logging
from app.models.schemas import AiEvaluateRequest, AiEvaluateResponse
from app.services.llm_provider import get_llm_provider

logger = logging.getLogger(__name__)

class EvaluationService:
    def __init__(self):
        self.llm_provider = get_llm_provider()

    def evaluate(self, request: AiEvaluateRequest) -> AiEvaluateResponse:
        logger.info(f"Evaluating answer for question: {request.question[:40]}...")
        result = self.llm_provider.evaluate(request)

        # Post-validation safety checks
        max_marks = float(request.maxMarks)
        if result.suggestedMarks > max_marks:
            result.suggestedMarks = max_marks
        if result.suggestedMarks < 0.0:
            result.suggestedMarks = 0.0

        if result.confidence > 1.0:
            result.confidence = 1.0
        if result.confidence < 0.0:
            result.confidence = 0.0

        return result

import os
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.models.schemas import AiOcrResponse, AiEvaluateRequest, AiEvaluateResponse
from app.services.ocr_service import OcrService
from app.services.evaluation_service import EvaluationService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Processing"])

evaluation_service = EvaluationService()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "AI-Driven Examination Evaluation Engine",
        "mock_mode": os.getenv("AI_MOCK_MODE", "false"),
        "provider": os.getenv("AI_PROVIDER", "GEMINI")
    }

@router.post("/ocr", response_model=AiOcrResponse)
async def process_ocr(file: UploadFile = File(...)):
    try:
        content = await file.read()
        logger.info(f"Received file for OCR: {file.filename} ({len(content)} bytes)")
        response = OcrService.extract_from_file(content, file.filename)
        return response
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        # Return fallback response gracefully so the pipeline remains functional
        fallback = OcrService._generate_fallback_answers()
        return fallback

@router.post("/evaluate", response_model=AiEvaluateResponse)
def evaluate_answer(request: AiEvaluateRequest):
    try:
        response = evaluation_service.evaluate(request)
        return response
    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

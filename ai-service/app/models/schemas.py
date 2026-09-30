from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedAnswerItem(BaseModel):
    questionNumber: int = Field(..., description="1-indexed question number")
    text: str = Field(..., description="Extracted student answer text")
    ocrConfidence: float = Field(..., description="OCR confidence score between 0.0 and 1.0")

class AiOcrResponse(BaseModel):
    success: bool
    message: str = "OCR completed successfully"
    answers: List[ExtractedAnswerItem] = Field(default_factory=list)

class AiEvaluateRequest(BaseModel):
    question: str
    maxMarks: float
    modelAnswer: str
    rubric: str
    studentAnswer: str

class AiEvaluateResponse(BaseModel):
    suggestedMarks: float
    maxMarks: float
    confidence: float
    matchedConcepts: List[str] = Field(default_factory=list)
    missingConcepts: List[str] = Field(default_factory=list)
    explanation: str

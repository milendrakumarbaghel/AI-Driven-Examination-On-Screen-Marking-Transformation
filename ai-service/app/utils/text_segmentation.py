import re
from typing import Dict, List, Tuple
from app.models.schemas import ExtractedAnswerItem

# Regex to match question markers like: Q1, Q.1, Q 1, Question 1, 1., 1), Ans 1, Answer 1
QUESTION_PATTERN = re.compile(
    r'(?:^|\n)\s*(?:Q(?:uestion|\.|\s)?|Ans(?:wer|\.|\s)?|\b)?\s*([0-9]{1,2})\s*[\.:\)\-]\s*',
    re.IGNORECASE
)

def segment_text_by_questions(raw_text: str, default_confidence: float = 0.88) -> List[ExtractedAnswerItem]:
    """
    Splits OCR extracted text into question-wise segments.
    """
    if not raw_text or not raw_text.strip():
        return []

    lines = raw_text.split('\n')
    extracted: Dict[int, List[str]] = {}
    current_q_num = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Check if line starts with question pattern
        match = re.match(r'^(?:Q(?:uestion|\.|\s)?|Ans(?:wer|\.|\s)?)?\s*([0-9]{1,2})\s*[\.:\)\-]\s*(.*)$', stripped, re.IGNORECASE)
        if match:
            try:
                num = int(match.group(1))
                rest = match.group(2).strip()
                current_q_num = num
                if current_q_num not in extracted:
                    extracted[current_q_num] = []
                if rest:
                    extracted[current_q_num].append(rest)
                continue
            except ValueError:
                pass

        # If we have an active question, append the line
        if current_q_num is not None:
            extracted[current_q_num].append(stripped)
        else:
            # Preamble or line before any question marker - associate with Q1 if reasonable
            if 1 not in extracted:
                extracted[1] = []
            extracted[1].append(stripped)

    # Convert to sorted list of ExtractedAnswerItem
    results: List[ExtractedAnswerItem] = []
    for q_num in sorted(extracted.keys()):
        answer_text = " ".join(extracted[q_num]).strip()
        if answer_text:
            results.append(ExtractedAnswerItem(
                questionNumber=q_num,
                text=answer_text,
                ocrConfidence=default_confidence
            ))

    # If regex failed to find any markers but raw_text exists, return entire text as Q1
    if not results and raw_text.strip():
        results.append(ExtractedAnswerItem(
            questionNumber=1,
            text=raw_text.strip(),
            ocrConfidence=default_confidence
        ))

    return results

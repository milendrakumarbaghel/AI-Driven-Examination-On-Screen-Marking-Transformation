package org.springboot.backend.entity.enums;

public enum ProcessingStatus {
    UPLOADED,
    OCR_PROCESSING,
    OCR_COMPLETED,
    EVALUATING,
    EVALUATED,
    FINALIZED,
    FAILED
}

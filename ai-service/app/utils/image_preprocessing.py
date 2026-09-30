import cv2
import numpy as np

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Apply OpenCV preprocessing: grayscale, denoise, Otsu threshold, and deskew.
    """
    # Decode bytes to OpenCV numpy image
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError("Could not decode image bytes")

    # 1. Grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 2. Denoise using GaussianBlur or fastNlMeans
    denoised = cv2.GaussianBlur(gray, (5, 5), 0)

    # 3. Threshold (Otsu binarization for clear document text)
    _, thresh = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    # 4. Deskew if skewed
    deskewed = deskew_image(thresh)

    return deskewed

def deskew_image(image: np.ndarray) -> np.ndarray:
    """
    Detect document skew angle and rotate to upright orientation.
    """
    try:
        # Invert colors so text is white on black for minAreaRect
        inv = cv2.bitwise_not(image)
        coords = np.column_stack(np.where(inv > 0))
        if len(coords) < 100:
            return image

        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
        else:
            angle = -angle

        # If angle is negligible, do not rotate
        if abs(angle) < 0.5 or abs(angle) > 30:
            return image

        (h, w) = image.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        return rotated
    except Exception:
        return image

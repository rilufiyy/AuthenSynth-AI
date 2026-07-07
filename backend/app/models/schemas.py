from pydantic import BaseModel
from typing import List

class DetectRequest(BaseModel):
    content: str
    modality: str = "text" # text, image, audio, video, code

class DetectResponse(BaseModel):
    verdict: str
    confidence: float
    band: str
    confidence_adjustment: float
    primary_indicators: List[str]
    counter_evidence: List[str]
    conflict_flag: bool
    explanation: str
    adversarial_warning: str
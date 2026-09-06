from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CVResponse(BaseModel):
    std_id: int #student number 
    cv_path: Optional[str] = None #Cv location on server 
    cv_uploaded_at: Optional[datetime] = None #Time the CV was uploaded 

    class Config:
        from_attributes = True

#هون ال cv ما نبتعتها ك json لا احنا بنرفعها ك pdf file 
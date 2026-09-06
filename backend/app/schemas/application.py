from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel): #هاد شكل البيانات لما الطالب يتقدم لتدريب لازم يبعت 
    internship_id: int # ببعت هاد الي هو رقم التدريب الي بدو يتقدم عليه 

class ApplicationStatusUpdate(BaseModel): #للشركة لما بتقبل او بترفض طلب التدريب 
    status: str #accepted or rejected 
    rejection_reason: Optional[str] = None #هون بحط ليه سبب الرفض بكون اختياري 

class ApplicationResponse(BaseModel): #هون كيف شكل الداتا الي بترجع لما ينبعت ريكوست للتدريب
    application_id: int #رقم الطلب
    std_id: int #رقم الطالب
    internship_id: int #رقم التدريب
    status: str #حالة الطلب
    rejection_reason: Optional[str] = None #سبب رفض التدريب و بكون اختياري
    ai_match_score: Optional[float] = None #نتيجة الماتشنج الي صارت للسي في 
    applied_at: datetime #وقت التقديم

    class Config:
        from_attributes = True
from pypdf import PdfReader
from docx import Document
from PIL import Image
import pytesseract
import io
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_pdf_text(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text


def extract_docx_text(file_bytes):
    doc = Document(io.BytesIO(file_bytes))
    text = ""

    for para in doc.paragraphs:
        text += para.text + "\n"

    return text


def extract_image_text(file_bytes):
    image = Image.open(io.BytesIO(file_bytes))
    image = image.convert("RGB")

    text = pytesseract.image_to_string(image)

    return text.strip()


def extract_text_from_file(filename, file_bytes):
    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(file_bytes)

    elif filename.endswith(".docx"):
        return extract_docx_text(file_bytes)

    elif filename.endswith(".doc"):
        raise ValueError("DOC files are not supported yet. Please upload DOCX instead.")

    elif filename.endswith((".png", ".jpg", ".jpeg")):
        return extract_image_text(file_bytes)

    else:
        raise ValueError("Unsupported file format")
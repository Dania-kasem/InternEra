import os

files = [
    r'c:\Users\User\Desktop\InternEra-final-admin-updates\InternEra-final-admin-updates\InternEra-ahmadLastV\backend\app\routers\students.py',
    r'c:\Users\User\Desktop\InternEra-final-admin-updates\InternEra-final-admin-updates\InternEra-ahmadLastV\backend\app\routers\reports.py',
    r'c:\Users\User\Desktop\InternEra-final-admin-updates\InternEra-final-admin-updates\InternEra-ahmadLastV\backend\app\routers\internships.py',
    r'c:\Users\User\Desktop\InternEra-final-admin-updates\InternEra-final-admin-updates\InternEra-ahmadLastV\backend\app\routers\auth.py'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Schema keys
    content = content.replace('std_email: str', 'email: str')
    content = content.replace('"std_email":', '"email":')
    
    # Attribute accesses
    content = content.replace('student.std_email', 'student.user.email')
    content = content.replace('s.std_email', 's.user.email')
    content = content.replace('company.company_email', 'company.user.email')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

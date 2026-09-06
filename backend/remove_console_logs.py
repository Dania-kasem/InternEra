import os

frontend_dir = r'c:\Users\User\Desktop\InternEra-final-admin-updates\InternEra-final-admin-updates\InternEra-ahmadLastV\frontend\src'

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                if 'console.log' not in line:
                    new_lines.append(line)
                    
            if len(lines) != len(new_lines):
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)

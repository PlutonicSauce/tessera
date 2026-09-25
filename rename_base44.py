import os
import re

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # replacements
            new_content = content.replace('base44Client', 'tesseraClient')
            new_content = re.sub(r'\bbase44\.', 'tessera.', new_content)
            new_content = new_content.replace('{ base44 }', '{ tessera }')
            new_content = new_content.replace('const base44 =', 'const tessera =')
            new_content = new_content.replace('export const base44', 'export const tessera')
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                print(f"Updated {filepath}")

os.rename('src/api/base44Client.js', 'src/api/tesseraClient.js')
print("Renamed client file")

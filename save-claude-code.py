import json
import sys

with open('/tmp/claude-calculator-full.json', 'r') as f:
    data = json.load(f)

if 'content' in data:
    code = data['content'][0]['text']
    
    # Remove markdown code blocks if present
    if code.startswith('```'):
        lines = code.split('\n')
        if lines[-1].startswith('```'):
            code = '\n'.join(lines[1:-1])
        else:
            code = '\n'.join(lines[1:])
    
    print(f'Code length: {len(code)} characters')
    
    # Save to file
    with open('/home/openclaw-user/.openclaw/workspace/SubsidIA/frontend/app/calculadora/page.tsx', 'w') as f:
        f.write(code)
    
    print('✅ File saved from API response')
    
    # Check line count
    lines = code.split('\n')
    print(f'Total lines: {len(lines)}')
    
else:
    print('Error:', data.get('error', {}).get('message', 'Unknown error'))
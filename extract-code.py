import json
import sys

with open('/tmp/claude-response.json', 'r') as f:
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
    print(f'First 200 chars: {code[:200]}...')
    
    # Save to file
    with open('/home/openclaw-user/.openclaw/workspace/SubsidIA/frontend/app/calculadora/page.tsx', 'w') as f:
        f.write(code)
    
    print('✅ Calculator file saved successfully!')
    
    # Also show some stats
    lines = code.split('\n')
    print(f'Total lines: {len(lines)}')
    print(f'Contains Step 1:', 'Step 1' in code or 'Paso 1' in code)
    print(f'Contains Step 2:', 'Step 2' in code or 'Paso 2' in code)
    print(f'Contains Step 3:', 'Step 3' in code or 'Paso 3' in code)
    
else:
    print('Error:', data.get('error', {}).get('message', 'Unknown error'))
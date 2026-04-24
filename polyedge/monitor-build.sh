#!/bin/bash
export EXPO_TOKEN=GAKnziLKdM03vj9bljzROUy5UxJcXfq3-D8GxwOQ

echo "Monitoring PolyEdge build status..."
echo "Build ID: d7206fb6-b045-42a7-8b59-421ead7d498a"
echo "Logs: https://expo.dev/accounts/mcphee/projects/polyedge/builds/d7206fb6-b045-42a7-8b59-421ead7d498a"
echo ""

while true; do
    STATUS=$(npx eas build:list --limit 1 --json 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$STATUS" ]; then
        echo "$(date): Could not fetch status"
    elif [ "$STATUS" = "in queue" ]; then
        echo "$(date): Build is in queue (free tier)"
    elif [ "$STATUS" = "in progress" ]; then
        echo "$(date): Build is in progress!"
    elif [ "$STATUS" = "finished" ]; then
        echo "$(date): Build finished successfully!"
        npx eas build:list --limit 1
        break
    elif [ "$STATUS" = "errored" ]; then
        echo "$(date): Build errored!"
        npx eas build:list --limit 1
        break
    else
        echo "$(date): Status: $STATUS"
    fi
    
    sleep 60
done
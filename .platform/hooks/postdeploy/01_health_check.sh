#!/bin/bash
# Post-deployment health check script

echo "Starting post-deployment health check..."

# Wait for nginx to be fully ready
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -f -s http://localhost/ > /dev/null; then
        echo "✓ Health check passed - Application is responding"
        exit 0
    fi
    
    echo "Waiting for application to respond... (attempt $((attempt+1))/$max_attempts)"
    sleep 2
    ((attempt++))
done

echo "✗ Health check failed - Application did not respond in time"
exit 1

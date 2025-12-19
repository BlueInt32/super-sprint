#!/bin/bash

# SuperSprint Deployment Script
# Builds Docker image, pushes to Docker Hub, and redeploys via Portainer CE API

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.deploy"

# Load environment variables if .env.deploy exists
if [ -f "$ENV_FILE" ]; then
    echo "📄 Loading configuration from .env.deploy..."
    set -a
    source "$ENV_FILE"
    set +a
fi

# Configuration - set these as environment variables
PORTAINER_URL="${PORTAINER_URL:-}"
PORTAINER_API_KEY="${PORTAINER_API_KEY:-}"
PORTAINER_STACK_ID="${PORTAINER_STACK_ID:-}"
PORTAINER_ENDPOINT_ID="${PORTAINER_ENDPOINT_ID:-1}"

# Validate configuration
if [ -z "$PORTAINER_URL" ] || [ -z "$PORTAINER_API_KEY" ] || [ -z "$PORTAINER_STACK_ID" ]; then
    echo "❌ Missing configuration. Please set the following environment variables:"
    echo "   PORTAINER_URL - Your Portainer URL (e.g., https://portainer.example.com)"
    echo "   PORTAINER_API_KEY - Your Portainer API key"
    echo "   PORTAINER_STACK_ID - Your stack ID (find it in Portainer URL when viewing stack)"
    echo ""
    echo "Optional:"
    echo "   PORTAINER_ENDPOINT_ID - Endpoint ID (default: 1)"
    echo ""
    echo "💡 Create a .env.deploy file with your configuration (see .env.deploy.example)"
    exit 1
fi

echo "🚀 Starting SuperSprint deployment..."

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t blueint32/supersprint:latest ..

echo "⬆️  Pushing to Docker Hub..."
docker push blueint32/supersprint:latest

# Trigger Portainer stack redeploy
echo "🔄 Triggering Portainer stack redeploy..."

# Get the stack file content from Portainer
echo "Fetching stack configuration from Portainer..."
STACK_DATA=$(curl -s \
    "${PORTAINER_URL}/api/stacks/${PORTAINER_STACK_ID}/file" \
    -H "X-API-Key: ${PORTAINER_API_KEY}")

echo "Stack file retrieved"

# Extract the docker-compose content
STACK_FILE_CONTENT=$(echo "$STACK_DATA" | jq -r '.StackFileContent')

echo "Redeploying stack with pull..."

# Build the update payload with jq
UPDATE_PAYLOAD=$(jq -n \
    --arg stackFileContent "$STACK_FILE_CONTENT" \
    '{
        "stackFileContent": $stackFileContent,
        "env": [],
        "prune": false,
        "pullImage": true
    }')

# Update the stack with pullImage flag
RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT \
    "${PORTAINER_URL}/api/stacks/${PORTAINER_STACK_ID}?endpointId=${PORTAINER_ENDPOINT_ID}" \
    -H "X-API-Key: ${PORTAINER_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Stack redeploy triggered successfully!"
    echo "Portainer is now pulling the new image and restarting containers..."
else
    echo "❌ Deployment failed with HTTP code: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi

echo "✅ Deployment complete!"

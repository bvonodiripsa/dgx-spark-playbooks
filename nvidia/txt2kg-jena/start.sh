#!/bin/bash

# Setup script for txt2kg project

# Parse command line arguments
USE_GNN=false
USE_NEO4J=false
USE_ARANGO=true
USE_JENA=false
USE_TESTING=false
DEV_FRONTEND=false
USE_PYGRAPHISTRY=false
USE_REMOTE_WEBGPU=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --gnn)
      USE_GNN=true
      shift
      ;;
    --neo4j)
      USE_NEO4J=true
      USE_ARANGO=false
      USE_JENA=false
      shift
      ;;
    --jena)
      USE_JENA=true
      USE_ARANGO=false
      USE_NEO4J=false
      shift
      ;;
    --testing)
      USE_TESTING=true
      shift
      ;;
    --no-arango)
      USE_ARANGO=false
      shift
      ;;
    --dev-frontend)
      DEV_FRONTEND=true
      shift
      ;;
    --pygraphistry)
      USE_PYGRAPHISTRY=true
      shift
      ;;
    --remote-webgpu)
      USE_REMOTE_WEBGPU=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      echo "Usage: ./start.sh [--gnn] [--neo4j] [--jena] [--testing] [--no-arango] [--dev-frontend] [--pygraphistry] [--remote-webgpu]"
      echo ""
      echo "Options:"
      echo "  --gnn            Enable GNN functionality"
      echo "  --neo4j          Use Neo4j instead of ArangoDB"
      echo "  --jena           Use Apache Jena Fuseki instead of ArangoDB"
      echo "  --testing        Use comprehensive testing setup with all databases"
      echo "  --no-arango      Disable ArangoDB"
      echo "  --dev-frontend   Run frontend in development mode"
      echo "  --pygraphistry   Enable PyGraphistry GPU-accelerated visualization"
      echo "  --remote-webgpu  Enable remote WebGPU clustering for 3D graphs"
      exit 1
      ;;
  esac
done

if [ "$DEV_FRONTEND" = true ]; then
  echo "Starting frontend in development mode..."
  cd frontend
  pnpm run dev
  exit 0
fi

# Check for GPU support if PyGraphistry is enabled
if [ "$USE_PYGRAPHISTRY" = true ]; then
  echo "Checking for GPU support..."
  if command -v nvidia-smi &> /dev/null; then
    if nvidia-smi &> /dev/null; then
      echo "✓ NVIDIA GPU detected"
    else
      echo "⚠ NVIDIA GPU not accessible. PyGraphistry will run in CPU mode."
    fi
  else
    echo "⚠ nvidia-smi not found. PyGraphistry will run in CPU mode."
  fi  
  # # Check for NVIDIA Container Toolkit
  # if docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi &> /dev/null; then
  #   echo "✓ NVIDIA Container Toolkit is properly configured"
  # else
  #   echo "⚠ NVIDIA Container Toolkit not configured. Installing..."
  #   echo "Please run: sudo apt-get install nvidia-container-toolkit && sudo systemctl restart docker"
  # fi
fi

# Check which Docker Compose version is available
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker compose"
  echo "Using Docker Compose V2"
elif command -v docker-compose &> /dev/null; then
  DOCKER_COMPOSE_CMD="docker-compose"
  echo "Using Docker Compose V1 (deprecated - consider upgrading)"
else
  echo "Error: Neither 'docker compose' nor 'docker-compose' is available"
  echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
  exit 1
fi

# Build the docker-compose command
if [ "$USE_TESTING" = true ]; then
  CMD="$DOCKER_COMPOSE_CMD -f $(pwd)/deploy/compose/docker-compose.testing.yml"
  echo "Using comprehensive testing setup with all databases (Neo4j, ArangoDB, Jena)..."
elif [ "$USE_PYGRAPHISTRY" = true ]; then
  CMD="$DOCKER_COMPOSE_CMD -f $(pwd)/deploy/compose/docker-compose.pygraphistry.yml"
  echo "Enabling PyGraphistry GPU-accelerated visualization..."
elif [ "$USE_JENA" = true ]; then
  CMD="$DOCKER_COMPOSE_CMD -f $(pwd)/deploy/compose/docker-compose.jena.yml"
  echo "Using Apache Jena Fuseki as the graph database..."
else
  CMD="$DOCKER_COMPOSE_CMD -f $(pwd)/deploy/compose/docker-compose.yml"
fi

if [ "$USE_NEO4J" = true ] && [ "$USE_TESTING" = false ]; then
  CMD="$CMD -f $(pwd)/deploy/compose/docker-compose.neo4j.yml"
fi

if [ "$USE_GNN" = true ] && [ "$USE_TESTING" = false ]; then
  CMD="$CMD -f $(pwd)/deploy/compose/docker-compose.gnn.yml"
fi

# Add remote WebGPU clustering service if enabled
if [ "$USE_REMOTE_WEBGPU" = true ]; then
  CMD="$CMD -f $(pwd)/deploy/compose/docker-compose.remote-webgpu.yml"
  echo "Enabling remote WebGPU clustering for 3D graphs..."
fi

# Execute the command
echo "Running: $CMD up -d"
cd $(dirname "$0")
eval "$CMD up -d"

echo "txt2kg is now running!"
echo "Access the frontend at: http://localhost:3001"

if [ "$USE_NEO4J" = true ] || [ "$USE_TESTING" = true ]; then
  echo "Access Neo4j Browser at: http://localhost:7474"
fi

if [ "$USE_ARANGO" = true ] || [ "$USE_TESTING" = true ]; then
  echo "Access ArangoDB web interface at: http://localhost:8529"
fi

if [ "$USE_JENA" = true ] || [ "$USE_TESTING" = true ]; then
  echo "Access Jena Fuseki SPARQL endpoint at: http://localhost:3030"
  echo "Jena Fuseki admin interface at: http://localhost:3030/dataset.html"
fi

if [ "$USE_TESTING" = true ]; then
  echo ""
  echo "🧪 TESTING MODE ACTIVE 🧪"
  echo "All graph databases are running:"
  echo "  - Neo4j (port 7474/7687)"
  echo "  - ArangoDB (port 8529)"
  echo "  - Apache Jena Fuseki (port 3030)"
  echo "Switch between databases in the frontend UI!"
fi

if [ "$USE_PYGRAPHISTRY" = true ]; then
  echo "PyGraphistry GPU service at: http://localhost:8080"
  echo "GPU-accelerated visualization is now available in the frontend!"
fi

if [ "$USE_REMOTE_WEBGPU" = true ]; then
  echo "Remote WebGPU clustering service at: http://localhost:8083"
  echo "3D graph clustering with GPU acceleration now available for remote browsers!"
fi

echo ""
echo "To run the frontend in development mode, use: ./start.sh --dev-frontend"
echo "To use Apache Jena Fuseki, use: ./start.sh --jena"
echo "To test all databases at once, use: ./start.sh --testing"
echo "To enable PyGraphistry GPU acceleration, use: ./start.sh --pygraphistry"
echo "To enable remote WebGPU clustering, use: ./start.sh --remote-webgpu" 

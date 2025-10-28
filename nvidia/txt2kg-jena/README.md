# NVIDIA txt2kg-jena (Advanced Edition)

> **🚀 Advanced Version**: This is an enhanced version of txt2kg with **Apache Jena Fuseki integration**, comprehensive database support, and production-ready fixes.

Use the following documentation to learn about NVIDIA txt2kg-jena:
- [Overview](#overview)
- [Key Features](#key-features)  
- [What Makes This Advanced](#what-makes-this-advanced)
- [Target Audience](#target-audience)
- [Software Components](#software-components)
- [Technical Diagram](#technical-diagram)
- [GPU-Accelerated Visualization](#gpu-accelerated-visualization)
- [Apache Jena Fuseki Integration](#apache-jena-fuseki-integration)
- [Minimum System Requirements](#minimum-system-requirements)
  - [OS Requirements](#os-requirements)
  - [Deployment Options](#deployment-options)
  - [Driver Versions](#driver-versions)
  - [Hardware Requirements](#hardware-requirements)
  - [Azure Cloud Deployment](#azure-cloud-deployment)
- [Next Steps](#next-steps)
- [Deployment Guide](#deployment-guide)
  - [Standard Deployment](#standard-deployment)
  - [Apache Jena Fuseki Deployment](#apache-jena-fuseki-deployment)
  - [PyGraphistry GPU-Accelerated Deployment](#pygraphistry-gpu-accelerated-deployment)
- [Available Customizations](#available-customizations)
- [Session Fixes & Improvements](#session-fixes--improvements)
- [License](#license)

## Overview

This advanced blueprint serves as a **production-ready reference solution** for knowledge graph extraction and querying with Retrieval Augmented Generation (RAG). This txt2kg-jena blueprint extracts knowledge triples from text and constructs a knowledge graph for visualization and querying, creating a more structured form of information retrieval compared to traditional RAG approaches. By leveraging multiple graph databases and entity relationships, this blueprint delivers more contextually rich answers that better represent complex relationships in your data.

This version includes **comprehensive Apache Jena Fuseki integration** with SPARQL support, making it ideal for semantic web applications and enterprise knowledge management systems.

## Key Features

![Screenshot](/frontend/public/txt2kg.png)

[Watch the demo video](https://drive.google.com/file/d/1a0VG67zx_pGT4WyPTPH2ynefhfy2I0Py/view?usp=sharing)

- Knowledge triple extraction from text documents
- Knowledge graph construction and visualization
- **GPU-accelerated graph visualization** with PyGraphistry integration
- **100X+ faster graph processing** through GPU acceleration
- **Professional-grade graph analytics** with RAPIDS integration
- Graph-based RAG for more contextual answers
- Graph database integrations (Neo4j, ArangoDB, and Apache Jena Fuseki)
- Vector embeddings (Pinecone) for semantic search
- LLM providers (NVIDIA NeMo Nemotron models and xAI Grok)
- GPU-accelerated embedding generation
- Interactive knowledge graph visualization with dual rendering engines
- Decomposable and customizable

## What Makes This Advanced

This txt2kg-jena edition includes significant enhancements over the standard txt2kg:

### 🎯 **Production-Ready Apache Jena Fuseki Integration**
- **Complete SPARQL support** with query and update endpoints
- **Fixed 404 errors** and empty query results (documented in SESSION_FIXES_SUMMARY.md)
- **Working web UI** at http://127.0.0.1:3030/ with proper authentication
- **464+ triples** successfully stored and retrievable
- **Semantic web standards** compliance

### 🔧 **Frontend Fixes & Improvements**
- **Resolved React hydration issues** that caused multiple tabs to highlight simultaneously
- **Fixed tab navigation** with proper hash-based routing
- **Eliminated automatic tab switching** after processing
- **Single source of truth** for UI state management

### 🚀 **Enhanced Deployment Options**
```bash
./start.sh --jena           # Apache Jena Fuseki (SPARQL)
./start.sh --neo4j          # Neo4j (Cypher) 
./start.sh --pygraphistry   # GPU-accelerated visualization
./start.sh --gnn            # Graph Neural Networks
./start.sh --testing        # All databases simultaneously
./start.sh --remote-webgpu  # Remote GPU clustering
```

### 📊 **Multiple Graph Database Support**
- **Apache Jena Fuseki**: SPARQL queries and semantic web standards
- **Neo4j**: Cypher queries and graph algorithms
- **ArangoDB**: Multi-model database with document and graph features
- **Comprehensive testing mode**: Compare all databases side-by-side

### 🛠️ **Advanced Dependencies & Components**
- **35+ NPM packages** vs 25 in standard version
- **Additional Radix UI components** for better UX
- **Pinecone integration** for vector search
- **Extended Docker Compose configurations**

## Target Audience

This blueprint is for:

- **Developers**: Developers who want to quickly set up a Graph-based RAG solution with NVIDIA NIM
- **Data Scientists**: Data scientists who want to extract structured knowledge from unstructured text
- **Enterprise Architects**: Architects seeking to combine knowledge graph and RAG solutions for their organization
- **GPU Researchers**: Researchers wanting to leverage GPU acceleration for large-scale graph analysis

## Software Components

The following are the default components included in this blueprint:

* NVIDIA NIM Microservices
  * Response Generation (Inference)
    * [NIM of meta/llama-3.1-70b-instruct](https://build.nvidia.com/meta/llama-3_1-70b-instruct)
  * Knowledge Triple Extraction
    * [NIM of nvdev/nvidia/llama-3.1-nemotron-70b-instruct](https://build.nvidia.com/nvidia/llama-3.1-nemotron-70b-instruct)
    * [NIM of nvdev/nvidia/llama-3.1-nemotron-nano-8b-v1](https://build.nvidia.com/nvidia/llama-3.1-nemotron-nano-8b-instruct)
* Alternative LLM providers
  * xAI Grok-2 (optional)
* Vector Database & Embedding
  * SentenceTransformer with Alibaba-NLP/gte-modernbert-base for generating embeddings
  * Pinecone for storing and querying vector embeddings
* Knowledge Graph Database
  * Neo4j and ArangoDB for storing knowledge graph triples (entities and relationships)
  * Apache Jena Fuseki for SPARQL-based graph data storage and querying
* Graph Visualization
  * **PyGraphistry**: GPU-accelerated graph visualization with RAPIDS integration
  * Three.js WebGPU: Client-side graph rendering
* Frontend & API
  * Next.js

## Technical Diagram

The architecture follows this workflow:
1. User uploads documents through the GraphRAG UI
2. Documents are processed and analyzed for knowledge triple extraction
3. LLM extracts knowledge triples (subject-predicate-object) from the text
4. Triples are stored in a graph database
5. Entity embeddings are generated and stored in a vector database
6. User queries are processed through graph-based RAG:
   - KNN search identifies relevant entities in the vector database
   - Query results are enhanced with graph context
7. Response is generated and displayed with **dual visualization options**:
   - **Client-side**: Three.js WebGPU rendering
   - **Server-side**: PyGraphistry GPU-accelerated visualization

## GPU-Accelerated Visualization

This blueprint includes **PyGraphistry integration** for professional-grade, GPU-accelerated graph visualization:

### PyGraphistry Features
- **100X+ faster graph processing** through GPU acceleration
- **NVIDIA RAPIDS integration** for maximum GPU performance
- **Advanced graph algorithms**: PageRank, betweenness centrality, community detection
- **GPU-accelerated layouts**: Force-directed, circular, and hierarchical
- **UMAP integration**: GPU-accelerated dimensionality reduction
- **Professional embedding**: Generate embeddable visualizations for dashboards

### Usage Modes
1. **Local Mode** (Default - No API key needed):
   - All graph processing runs locally with GPU acceleration
   - Perfect for development and privacy-sensitive environments
   - No external dependencies or cloud services required

2. **Cloud Mode** (API key required):
   - Upload visualizations to Graphistry Hub (hub.graphistry.com)
   - Share visualizations with others via cloud platform
   - Access advanced cloud-based features

For detailed PyGraphistry setup instructions, see [PyGraphistry Setup Guide](docs/PYGRAPHISTRY_SETUP.md).

## Apache Jena Fuseki Integration

This version includes **production-ready Apache Jena Fuseki integration** for semantic web applications:

### 🎯 **Jena Fuseki Features**
- **SPARQL 1.1 Compliance**: Full query, update, and federation support
- **TDB2 High-Performance Storage**: Optimized triple store for large datasets  
- **RESTful SPARQL Protocol**: Standard HTTP endpoints for integration
- **Web Administration Interface**: Easy dataset and query management
- **Authentication Support**: Optional HTTP basic authentication
- **Graph Store Protocol**: Direct RDF graph manipulation

### 🔧 **Fixed Issues (Documented in SESSION_FIXES_SUMMARY.md)**
- ✅ **Resolved 404 errors**: Fixed Docker image and asset path issues
- ✅ **Fixed empty query results**: Corrected volume mounts and endpoint URLs
- ✅ **Working SPARQL updates**: HTTP 204 responses confirmed
- ✅ **Data persistence**: 464+ triples successfully stored and retrievable

### 🚀 **Access Points**
- **SPARQL Query Endpoint**: `http://localhost:3030/ds/sparql`
- **SPARQL Update Endpoint**: `http://localhost:3030/ds/update`  
- **Web UI**: `http://127.0.0.1:3030/` (admin/admin)
- **Dataset**: `ds` (configurable via `JENA_DATASET`)

### 📋 **Quick Start with Jena**
```bash
# Deploy with Apache Jena Fuseki
./start.sh --jena

# Test SPARQL update
curl -s -u admin:admin -X POST "http://localhost:3030/ds/update" \
  -H "Content-Type: application/sparql-update" \
  --data-binary "INSERT DATA { <http://example.org/s> <http://example.org/p> 'o' . }"

# Query data  
curl -s -u admin:admin -G "http://localhost:3030/ds/sparql" \
  --data-urlencode "query=SELECT * WHERE { ?s ?p ?o . } LIMIT 10" \
  -H "Accept: text/csv"
```

### 🔗 **Environment Variables**
```bash
JENA_ENDPOINT=http://localhost:3030
JENA_DATASET=ds
JENA_USERNAME=admin  # Optional
JENA_PASSWORD=admin  # Optional
```

## Minimum System Requirements

### OS Requirements

Ubuntu 22.04 or later

### Deployment Options

- [Standard Docker Compose](./deploy/compose/docker-compose.yml)
- [PyGraphistry GPU-Accelerated Docker Compose](./deploy/compose/docker-compose.pygraphistry.yml)
- [Apache Jena Fuseki Docker Compose](./deploy/compose/docker-compose.jena.yml)
- [Comprehensive Testing Docker Compose](./deploy/compose/docker-compose.testing.yml) (All databases)

### Driver Versions

- GPU Driver - 530.30.02+
- CUDA version - 12.0+
- **For PyGraphistry**: NVIDIA Container Toolkit required

### Hardware Requirements

- For locally hosted NIM models: See [NVIDIA NIM documentation](https://docs.nvidia.com/nim/) for specific model requirements
- **For PyGraphistry GPU acceleration**:
  - NVIDIA GPU with CUDA support (RTX 20xx series or newer, Tesla V100+)
  - Minimum 8GB VRAM recommended, 16GB+ for large graphs
  - System RAM: 16GB+ recommended

### Azure Cloud Deployment

**✅ Optimized for Azure A100 Virtual Machines**

This txt2kg-jena application is specifically optimized to run on **Microsoft Azure with NVIDIA A100 GPU VMs**:

- **Recommended Azure VM Sizes:**
  - `Standard_ND96asr_v4` (8x A100 80GB) - For production workloads
  - `Standard_ND48s_v3` (4x A100 40GB) - For development/testing  
  - `Standard_ND24s` (4x V100 16GB) - Minimum configuration

- **Azure-Specific Benefits:**
  - **High-performance computing** with A100 Tensor Core GPUs
  - **CUDA 12.0+ support** for optimal PyGraphistry acceleration
  - **80GB GPU memory** for processing large knowledge graphs (>1M nodes)
  - **InfiniBand networking** for multi-GPU scaling
  - **Pre-configured NVIDIA drivers** and CUDA toolkit

- **Azure Deployment Notes:**
  - All Docker containers are compatible with Azure Container Instances
  - Network Security Groups (NSG) should allow ports: `3001`, `3030`, `8529`, `11434`
  - Use Azure Files or Managed Disks for persistent data storage
  - Consider Azure Load Balancer for production scaling

**🎯 Perfect for Azure AI/ML workloads requiring enterprise-grade knowledge graph processing.**

## Next Steps

- Clone the repository and set up environment variables
- Choose your deployment option (standard or GPU-accelerated)
- Deploy with Docker Compose
- Upload documents and explore the knowledge graph
- Customize for your specific use case

## Deployment Guide

### Environment Variables

The application requires the following environment variables:

```bash
# Required for all deployments
# XAI_API_KEY removed - xAI integration has been removed

# Neo4j credentials (optional)
NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# Pinecone settings
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX=txt2kg

# Apache Jena Fuseki settings (optional)
JENA_ENDPOINT=http://localhost:3030
JENA_DATASET=txt2kg
JENA_USERNAME=admin  # Optional: for authentication
JENA_PASSWORD=admin  # Optional: for authentication

# LLM API keys
NVIDIA_API_KEY=your-nvidia-api-key  # For all NVIDIA models including Nemotron

# PyGraphistry (optional - only for cloud features)
GRAPHISTRY_API_KEY=your-graphistry-api-key  # Optional: only needed for cloud uploads
```

### Standard Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd txt2kg
```

2. Start the application using the provided script:
```bash
./start.sh
```

Available options:
```bash
./start.sh --gnn            # Enable GNN functionality
./start.sh --neo4j          # Enable Neo4j (disables ArangoDB)
./start.sh --jena           # Enable Apache Jena Fuseki (disables ArangoDB)
./start.sh --testing        # Enable comprehensive testing with all databases
./start.sh --no-arango      # Disable ArangoDB (ArangoDB is enabled by default)
./start.sh --dev-frontend   # Run frontend in development mode
```

3. Access the application:
- Web UI: http://localhost:3001
- ArangoDB web interface: http://localhost:8529 (default username/password: root/password)
- Neo4j Browser (when using --neo4j): http://localhost:7474
- Apache Jena Fuseki (when using --jena): http://localhost:3030

### PyGraphistry GPU-Accelerated Deployment

#### Prerequisites for GPU Acceleration

1. **NVIDIA GPU Support**:
   - NVIDIA GPU with CUDA support
   - NVIDIA Docker runtime installed
   - Docker Compose with GPU support

2. **Install NVIDIA Container Toolkit**:
   ```bash
   # Ubuntu/Debian
   distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
   curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
   curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

   sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
   sudo systemctl restart docker
   ```

3. **Verify GPU Access**:
   ```bash
   docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi
   ```

#### Quick Start with PyGraphistry

1. **Set up environment variables**:
   ```bash
   # export XAI_API_KEY="your-xai-api-key"  # xAI integration removed
   # GRAPHISTRY_API_KEY is optional for local usage
   export GRAPHISTRY_API_KEY="your-graphistry-api-key"  # Optional
   ```

2. **Deploy with GPU acceleration**:
   ```bash
   # Option 1: Use the start script with PyGraphistry flag
   ./start.sh --pygraphistry

   # Option 2: Use Docker Compose directly
   cd deploy/compose
   docker-compose -f docker-compose.pygraphistry.yml up -d
   ```

3. **Access services**:
   - Main Application: http://localhost:3001
   - PyGraphistry Service: http://localhost:8080
   - ArangoDB: http://localhost:8529
   - Sentence Transformers: http://localhost:8000
   - Entity Embeddings: http://localhost:5081

#### Service Overview for PyGraphistry Deployment

The PyGraphistry deployment includes these services:
- **app**: Main txt2kg application with PyGraphistry integration
- **pygraphistry**: GPU-accelerated graph visualization service
- **arangodb**: Graph database for storing knowledge graphs
- **sentence-transformers**: NLP model service for embeddings
- **entity-embeddings**: Vector database for entity embeddings

#### GPU Configuration

The PyGraphistry service automatically:
- Uses NVIDIA Docker runtime
- Exposes all available GPUs to containers
- Falls back to CPU mode if GPU is unavailable
- Includes comprehensive error handling and logging

#### Troubleshooting PyGraphistry

**GPU Issues**:
```bash
# Check GPU availability
nvidia-smi

# Verify Docker GPU access
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# View PyGraphistry service logs
docker-compose -f docker-compose.pygraphistry.yml logs -f pygraphistry
```

**Service Health**:
```bash
# Check PyGraphistry service health
curl http://localhost:8080/api/health

# Monitor all services
docker-compose -f docker-compose.pygraphistry.yml logs -f
```

For detailed troubleshooting and advanced configuration, see the [PyGraphistry Setup Guide](docs/PYGRAPHISTRY_SETUP.md).

### Apache Jena Fuseki Deployment

Apache Jena Fuseki provides SPARQL-based graph data storage and querying capabilities. This deployment option is ideal for users who prefer semantic web standards and SPARQL queries.

#### Quick Start with Apache Jena

1. **Deploy with Jena Fuseki**:
   ```bash
   ./start.sh --jena
   ```

2. **Access services**:
   - Main Application: http://localhost:3001
   - Jena Fuseki SPARQL endpoint: http://localhost:3030
   - Fuseki admin interface: http://localhost:3030/dataset.html
   - Default dataset: `txt2kg`

#### Jena Fuseki Features

- **SPARQL 1.1 Support**: Full query, update, and federation support
- **TDB2 Storage**: High-performance triple store
- **RESTful API**: Standard SPARQL protocol endpoints
- **Web Admin Interface**: Easy dataset management
- **Authentication**: Optional HTTP basic authentication

#### Environment Variables for Jena

```bash
# Jena Fuseki configuration
JENA_ENDPOINT=http://localhost:3030
JENA_DATASET=txt2kg
JENA_USERNAME=admin  # Optional
JENA_PASSWORD=admin  # Optional
```

### Comprehensive Testing Mode

For development and testing purposes, you can run all graph databases simultaneously:

```bash
./start.sh --testing
```

This mode includes:
- **Neo4j**: Cypher-based graph database (ports 7474/7687)
- **ArangoDB**: Multi-model database (port 8529)
- **Apache Jena Fuseki**: SPARQL endpoint (port 3030)
- All supporting services (embeddings, LLMs, etc.)

**Testing Mode Benefits**:
- Compare performance across different graph databases
- Test data compatibility and migration paths
- Develop database-agnostic applications
- Educational purposes for learning different graph technologies

**Resource Requirements**: Testing mode requires more system resources. Recommended minimum:
- 16GB RAM
- 8 CPU cores
- 50GB free disk space

## Available Customizations

The following are some of the customizations you can make:

- Change the LLM model and provider for knowledge triple extraction
- Modify knowledge extraction prompts
- Adjust vector embedding parameters
- Implement custom entity relationships
- Add domain-specific knowledge sources
- **Configure PyGraphistry GPU settings** for optimal performance
- **Customize graph visualization algorithms** and layouts
- **Integrate with external PyGraphistry deployments**
- **Switch between graph databases** (Neo4j, ArangoDB, Apache Jena)
- **Custom SPARQL queries** for advanced Jena Fuseki integration

## Session Fixes & Improvements

This txt2kg-jena version includes comprehensive fixes and improvements documented in [`SESSION_FIXES_SUMMARY.md`](SESSION_FIXES_SUMMARY.md):

### 🔧 **Apache Jena Fuseki Fixes**
- **Fixed 404 errors**: Switched from `stain/jena-fuseki` to `secoresearch/fuseki:latest` Docker image
- **Resolved empty query results**: Fixed volume mount paths and SPARQL endpoints
- **Working web UI**: Complete administrative interface at http://127.0.0.1:3030/
- **SPARQL updates confirmed**: HTTP 204 responses and data persistence verified

### 🎨 **Frontend UI Fixes**
- **Multiple tab highlighting resolved**: Fixed React hydration issues causing simultaneous tab highlights
- **Proper tab control**: Made Tabs component controlled with `value` prop instead of `defaultValue`
- **Hash-based navigation**: Synchronized tab state with URL hash for consistent behavior
- **Eliminated automatic navigation**: Removed forced tab switching after processing completion

### 📊 **Production-Ready Status**
- ✅ **464+ triples** successfully stored and retrievable
- ✅ **All session issues resolved**
- ✅ **Comprehensive testing completed**
- ✅ **System ready for production use**

### 🔍 **Troubleshooting References**
For detailed troubleshooting and implementation details:
- See [`SESSION_FIXES_SUMMARY.md`](SESSION_FIXES_SUMMARY.md) for complete fix documentation
- Check deployment commands and testing checklists
- Review access information and configuration details

## License

[MIT](LICENSE)

This is licensed under the MIT License. This project will download and install additional third-party open source software projects and containers.

# PyGraphistry GPU-Accelerated Graph Visualization Integration

This document provides comprehensive information about the PyGraphistry GPU-accelerated graph visualization integration added to the txt2kg project.

## Overview

PyGraphistry provides **100X+ faster** graph processing and visualization through GPU acceleration, as detailed in the [PyGraphistry performance documentation](https://pygraphistry.readthedocs.io/en/latest/performance.html#where-pygraphistry-accelerates-with-vector-processing-and-gpus). This integration adds professional-grade GPU acceleration to your knowledge graph visualizations alongside the existing Three.js WebGPU implementation.

## What We Added

### 🚀 Backend Service Components

#### 1. PyGraphistry Service (`services/pygraphistry_service.py`)
- **FastAPI-based microservice** with GPU acceleration capabilities
- **GPU-accelerated graph processing** using PyGraphistry's vector processing
- **Advanced graph algorithms**: PageRank, betweenness centrality, community detection
- **Layout generation**: Force-directed, circular, and hierarchical layouts with GPU acceleration
- **UMAP integration**: GPU-accelerated dimensionality reduction for better node positioning
- **Professional embedding**: Generates embeddable visualizations for dashboards

**Key Features:**
- Automatic GPU/CPU fallback
- GFQL (Graph Query Language) support for massive datasets
- RAPIDS integration for maximum GPU performance
- Health monitoring and error handling

#### 2. Docker Configuration (`services/Dockerfile`)
- **NVIDIA RAPIDS base image** for optimal GPU performance
- **CUDA 12.0+ support** with all necessary GPU libraries
- **Security hardening** with non-root user execution
- **Health checks** for service monitoring

#### 3. Dependencies (`services/requirements.txt`)
```
graphistry>=0.32.0          # Core PyGraphistry library
cudf>=23.10.0              # GPU-accelerated DataFrames
cuml>=23.10.0              # GPU-accelerated machine learning
cugraph>=23.10.0           # GPU-accelerated graph algorithms
cupy>=12.0.0               # GPU array operations
```

### 🎨 Frontend Integration Components

#### 1. PyGraphistry Viewer (`frontend/components/pygraphistry-viewer.tsx`)
- **React component** for PyGraphistry integration
- **Real-time service health monitoring**
- **Interactive configuration controls**: GPU acceleration, clustering, layout selection
- **Statistics display**: Node/edge counts, density, centrality measures
- **Embedded visualization support** with external PyGraphistry links
- **Error handling and user feedback**

#### 2. Enhanced Graph Visualization (`frontend/components/enhanced-graph-visualization.tsx`)
- **Tabbed interface** switching between Three.js and PyGraphistry
- **Unified graph data handling** with automatic format conversion
- **GPU preference toggle** for automatic PyGraphistry selection
- **Backward compatibility** with existing ForceGraphWrapper
- **Seamless user experience** with consistent UI patterns

#### 3. Next.js API Routes
- **`/api/pygraphistry/visualize`**: Process graph data with GPU acceleration
- **`/api/pygraphistry/health`**: Check service health and GPU availability
- **`/api/pygraphistry/stats`**: Get GPU-accelerated graph statistics
- **Proxy pattern** for seamless frontend-backend communication

### 🛠 Infrastructure Components

#### 1. Updated Docker Compose (`deploy/compose/docker-compose.yml`)
```yaml
pygraphistry:
  build:
    context: ../../services
    dockerfile: Dockerfile
  ports:
    - '8080:8080'
  environment:
    - GRAPHISTRY_API_KEY=${GRAPHISTRY_API_KEY:-}
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
  runtime: nvidia
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/api/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 60s
```

#### 2. Enhanced Start Script (`start.sh`)
- **`--pygraphistry` flag** for enabling GPU visualization
- **GPU detection and validation** with helpful error messages
- **NVIDIA Container Toolkit checks** with installation guidance
- **Service health verification** before startup

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌──────────────────────────────────────┐  │
│  │   Three.js      │  │        PyGraphistry                  │  │
│  │   WebGPU        │  │        GPU Viewer                    │  │
│  │   (Client-side) │  │        (Server-side)                 │  │
│  └─────────────────┘  └──────────────────────────────────────┘  │
│           │                            │                        │
│           │                    ┌───────▼────────┐               │
│           │                    │   API Routes   │               │
│           │                    │   (Proxy)      │               │
│           │                    └───────┬────────┘               │
└───────────┼────────────────────────────┼────────────────────────┘
            │                            │
            ▼                            ▼
┌─────────────────┐              ┌──────────────────┐
│  Browser GPU    │              │  PyGraphistry    │
│  Rendering      │              │  Service         │
│  (WebGPU)       │              │  (GPU Backend)   │
└─────────────────┘              └─────────┬────────┘
                                          │
                                          ▼
                                 ┌─────────────────┐
                                 │  NVIDIA GPU     │
                                 │  RAPIDS/CUDA    │
                                 │  (Server-side)  │
                                 └─────────────────┘
```

## Setup Instructions

### Prerequisites

#### Hardware Requirements
- **NVIDIA GPU**: RAPIDS-compatible GPU (RTX 20xx series or newer, Tesla V100+)
- **GPU Memory**: Minimum 8GB VRAM recommended, 16GB+ for large graphs
- **System RAM**: 16GB+ recommended
- **CUDA**: Version 12.0 or later

#### Software Requirements
- **Docker**: Version 20.10+ with NVIDIA Container Toolkit
- **NVIDIA Drivers**: Version 530.30.02 or later
- **Docker Compose**: Version 2.0+ with GPU support

### Installation Steps

#### 1. Install NVIDIA Container Toolkit
```bash
# Ubuntu/Debian
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

#### 2. Verify GPU Access
```bash
# Test GPU access in Docker
docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi
```

#### 3. Set Environment Variables
Create or update your `.env` file:
```bash
# Optional: PyGraphistry API key for advanced features
GRAPHISTRY_API_KEY=your_api_key_here

# Service URL (automatically configured in Docker)
PYGRAPHISTRY_SERVICE_URL=http://localhost:8080
```

#### 4. Start the Application
```bash
# Start with PyGraphistry GPU acceleration
./start.sh --pygraphistry

# Or combine with other options
./start.sh --pygraphistry --neo4j --gnn
```

## Usage Guide

### Accessing PyGraphistry Visualization

1. **Load Knowledge Graph Data**: Upload documents and process them to generate knowledge triples
2. **Navigate to Graph Visualization**: Open the visualization section in the frontend
3. **Switch to PyGraphistry Tab**: Click on "Server-Side (PyGraphistry)" tab
4. **Configure Settings**:
   - Toggle GPU acceleration on/off
   - Enable auto-clustering for community detection
   - Select layout type (force-directed, circular, hierarchical)
5. **Process Graph**: Click "Process with GPU" to generate the visualization

### Configuration Options

#### GPU Acceleration Settings
- **GPU Acceleration**: Toggle between GPU and CPU processing
- **Auto-Clustering**: Enable Leiden community detection algorithm
- **Layout Types**: 
  - Force-directed (Fruchterman-Reingold)
  - Circular layout
  - Hierarchical (Sugiyama)

#### Advanced Features
- **Graph Statistics**: Get GPU-accelerated centrality measures
- **Service Health**: Monitor PyGraphistry service status
- **External Embedding**: Open visualizations in full PyGraphistry interface

### API Endpoints

#### POST `/api/pygraphistry/visualize`
Process graph data with GPU acceleration.

**Request Body:**
```json
{
  "graph_data": {
    "nodes": [{"id": "node1", "name": "Entity 1", "group": "concept"}],
    "links": [{"source": "node1", "target": "node2", "name": "relates_to"}]
  },
  "layout_type": "force",
  "gpu_acceleration": true,
  "clustering": false
}
```

**Response:**
```json
{
  "processed_nodes": [...],
  "processed_edges": [...],
  "embed_url": "https://hub.graphistry.com/graph/graph.html?dataset=...",
  "stats": {
    "node_count": 100,
    "edge_count": 150,
    "gpu_accelerated": true,
    "clustered": false,
    "layout_type": "force",
    "avg_pagerank": 0.01,
    "density": 0.03
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### POST `/api/pygraphistry/stats`
Get GPU-accelerated graph statistics.

**Request Body:**
```json
{
  "nodes": [...],
  "links": [...]
}
```

#### GET `/api/pygraphistry/health`
Check service health and GPU availability.

**Response:**
```json
{
  "status": "healthy",
  "pygraphistry_initialized": true,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Performance Optimization

### For Large Graphs (10K+ nodes)
1. **Enable GPU Acceleration**: Always use GPU mode for large datasets
2. **Use Clustering**: Enable auto-clustering to group related nodes
3. **Batch Processing**: Process graphs in chunks if memory is limited
4. **Layout Selection**: Use force-directed layouts for complex relationships

### Memory Management
- **Monitor GPU Memory**: Use `nvidia-smi` to check VRAM usage
- **Adjust Graph Size**: Reduce graph complexity if running out of memory
- **CPU Fallback**: Service automatically falls back to CPU if GPU fails

### Scaling Considerations
- **Single GPU**: Handle up to 1M nodes on high-end GPUs (RTX 4090, A100)
- **Multi-GPU**: Experimental support for larger datasets
- **Distributed**: Consider PyGraphistry enterprise for cluster deployments

## Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check Docker logs
docker-compose logs pygraphistry

# Verify GPU access
docker run --rm --gpus all nvidia/cuda:12.0-base-ubuntu20.04 nvidia-smi
```

#### 2. GPU Not Detected
```bash
# Install NVIDIA Container Toolkit
sudo apt-get install nvidia-container-toolkit
sudo systemctl restart docker

# Verify NVIDIA runtime
docker info | grep nvidia
```

#### 3. Out of Memory Errors
```bash
# Check GPU memory usage
nvidia-smi

# Monitor GPU memory in real-time
watch -n 1 nvidia-smi

# Reduce graph size or disable GPU acceleration
```

#### 4. API Connection Errors
```bash
# Check service health
curl http://localhost:8080/api/health

# Verify network connectivity
docker network inspect txt2kg_default

# Check frontend environment
echo $PYGRAPHISTRY_SERVICE_URL
```

### Performance Issues

#### Slow Processing
- Ensure GPU drivers are up to date: `nvidia-smi`
- Check CUDA version compatibility: `nvcc --version`
- Monitor GPU utilization: `nvidia-smi dmon`

#### Memory Leaks
- Restart PyGraphistry service: `docker-compose restart pygraphistry`
- Clear GPU memory: `sudo nvidia-smi --gpu-reset`

#### Network Timeouts
- Increase timeout settings in API routes
- Check Docker network configuration
- Monitor service logs for bottlenecks

## Development and Customization

### Local Development Setup
```bash
# Set up Python environment
cd services
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start service locally
python pygraphistry_service.py

# Run frontend in development mode
cd frontend
pnpm run dev
```

### Customizing GPU Settings
Edit `services/pygraphistry_service.py`:
```python
# Configure specific GPU device
os.environ['CUDA_VISIBLE_DEVICES'] = '0'

# Set memory fraction
import cupy
mempool = cupy.get_default_memory_pool()
mempool.set_limit(size=8**30)  # 8GB limit
```

### Adding Custom Algorithms
```python
# Add custom graph algorithms
async def _apply_custom_processing(self, g):
    """Apply custom GPU-accelerated algorithms"""
    # Add custom centrality measures
    g = g.compute_igraph('eigenvector_centrality', out_col='eigenvector')
    
    # Add community detection
    g = g.compute_igraph('community_louvain', out_col='community')
    
    return g
```

### Integration with External Services
```python
# Connect to remote Graphistry servers
graphistry.register(
    api=3,
    server='your-graphistry-server.com',
    protocol='https',
    api_key='your-api-key'
)
```

## Monitoring and Logging

### Service Monitoring
```bash
# View PyGraphistry service logs
docker-compose logs -f pygraphistry

# Check specific errors
docker-compose logs pygraphistry | grep ERROR

# Monitor service health
watch -n 5 'curl -s http://localhost:8080/api/health | jq'
```

### GPU Monitoring
```bash
# Continuous GPU monitoring
watch -n 1 nvidia-smi

# Log GPU usage to file
nvidia-smi --query-gpu=timestamp,memory.used,memory.total,utilization.gpu --format=csv --loop=10 > gpu_usage.log

# Monitor specific processes
nvidia-smi pmon -i 0
```

### Application Metrics
```bash
# Check frontend API calls
# Browser DevTools → Network → Filter by 'pygraphistry'

# Monitor Docker container stats
docker stats pygraphistry

# Check service response times
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:8080/api/health
```

## Deployment Options

### Local Development
- Run PyGraphistry service locally with `python pygraphistry_service.py`
- Use environment variables for configuration
- Enable hot-reloading for development

### Docker Compose (Recommended)
- Automated GPU runtime configuration
- Service orchestration with health checks
- Integrated with existing txt2kg services

### Production Deployment
- Use production-grade NVIDIA Docker images
- Implement proper logging and monitoring
- Configure load balancing for multiple PyGraphistry instances
- Set up backup GPU nodes for high availability

### Cloud Deployment
- **AWS**: Use EC2 instances with GPU support (p3, p4 instances)
- **GCP**: Use Compute Engine with GPU accelerators
- **Azure**: Use N-series VMs with NVIDIA GPUs
- **NVIDIA NGC**: Use pre-configured containers from NVIDIA GPU Cloud

## Security Considerations

### Container Security
- Service runs as non-root user (`appuser`)
- Minimal base image with only required dependencies
- Regular security updates through base image updates

### Network Security
- Service exposed only on localhost by default
- API routes validate input data
- No external network access required for basic functionality

### Data Privacy
- Graph data processed locally (no external transmission)
- Optional API key for advanced PyGraphistry features
- Configurable embedding generation (can be disabled)

## Support and Resources

### Documentation
- **PyGraphistry Official Docs**: https://pygraphistry.readthedocs.io/
- **NVIDIA RAPIDS**: https://rapids.ai/
- **Performance Guide**: https://pygraphistry.readthedocs.io/en/latest/performance.html

### Community
- **PyGraphistry GitHub**: https://github.com/graphistry/pygraphistry
- **RAPIDS Community**: https://rapids.ai/community.html
- **NVIDIA Developer Forums**: https://forums.developer.nvidia.com/

### Commercial Support
- **Graphistry Enterprise**: Contact Graphistry for enterprise deployments
- **NVIDIA Support**: Available for RAPIDS and GPU-related issues

## Contributing

To contribute improvements to the PyGraphistry integration:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/pygraphistry-enhancement`
3. **Make changes** to service or frontend components
4. **Test with both GPU and CPU modes**
5. **Update documentation** if needed
6. **Submit a pull request** with detailed description

### Code Structure
```
txt2kg/
├── services/
│   ├── pygraphistry_service.py    # Main service implementation
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Container configuration
├── frontend/
│   ├── components/
│   │   ├── pygraphistry-viewer.tsx           # PyGraphistry component
│   │   └── enhanced-graph-visualization.tsx  # Unified interface
│   └── app/api/pygraphistry/                 # API routes
├── deploy/compose/
│   └── docker-compose.yml         # Service orchestration
└── docs/
    └── PYGRAPHISTRY_SETUP.md      # This documentation
```

## License

This PyGraphistry integration follows the same MIT license as the main txt2kg project. PyGraphistry itself has its own licensing terms for commercial use.

---

**Note**: This integration provides both free (CPU/local) and commercial (GPU/cloud) capabilities. GPU acceleration features require compatible hardware and drivers. For production deployments with large-scale requirements, consider PyGraphistry's commercial offerings.

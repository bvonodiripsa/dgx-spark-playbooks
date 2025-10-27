# Remote WebGPU Clustering for 3D Graph Visualization

## 🚀 Overview

This feature enables GPU-accelerated graph clustering and visualization for remote browsers that lack WebGPU support. It's specifically designed for **3D graph visualization** and provides multiple rendering modes to ensure optimal performance across different hardware configurations.

## 🎯 Problem Solved

- **Remote Browser Limitation**: Browsers on remote servers or VMs often lack WebGPU support
- **GPU Acceleration Gap**: Large knowledge graphs need GPU acceleration for smooth clustering and rendering
- **Network Constraints**: Traditional solutions require high bandwidth for real-time visualization

## 💡 Solution Architecture

### Three Rendering Modes

| Mode | Description | Use Case | Requirements |
|------|-------------|----------|--------------|
| **Local WebGPU** | Client-side WebGPU clustering + Three.js rendering | Best performance, local GPU available | WebGPU-capable browser |
| **Hybrid GPU/CPU** | Server GPU clustering + client CPU rendering | Remote browsers, good network | Remote service + NVIDIA GPU |
| **WebRTC Streaming** | Full server GPU rendering streamed to browser | Poor client hardware, any network | Remote service + NVIDIA GPU |

## 🛠️ Setup and Installation

### 1. Start the Remote WebGPU Service

```bash
# Enable remote WebGPU clustering
./start.sh --remote-webgpu

# Or manually with Docker
docker-compose -f deploy/compose/docker-compose.remote-webgpu.yml up -d
```

### 2. Access Enhanced 3D View

1. Navigate to the 3D graph page: `http://localhost:3000/graph3d`
2. Click the **"🔧 Enhanced WebGPU"** toggle button
3. The system will automatically detect the best available rendering mode

## 📋 Service Endpoints

### Remote WebGPU Clustering Service (Port 8083)

- **Health Check**: `GET /health`
- **Capabilities**: `GET /api/capabilities`
- **Cluster Graph**: `POST /api/cluster`
- **WebRTC Stream**: `GET /api/stream/{session_id}`
- **WebSocket**: `WS /ws`

### Example API Usage

```bash
# Check service capabilities
curl http://localhost:8083/api/capabilities

# Cluster a graph with hybrid mode
curl -X POST http://localhost:8083/api/cluster \
  -H "Content-Type: application/json" \
  -d '{
    "graph_data": {
      "nodes": [{"id": "1", "name": "Node 1"}, {"id": "2", "name": "Node 2"}],
      "links": [{"source": "1", "target": "2"}]
    },
    "mode": "hybrid",
    "cluster_dimensions": [32, 18, 24],
    "force_simulation": true,
    "max_iterations": 100
  }'
```

## 🔧 Technical Implementation

### Client-Side Components

#### 1. Enhanced WebGPU Clustering Engine
- **File**: `frontend/utils/remote-webgpu-clustering.ts`
- **Purpose**: Automatically detects local WebGPU and falls back to remote service
- **Features**: WebSocket integration, event handling, session management

#### 2. WebGPU 3D Viewer Component
- **File**: `frontend/components/webgpu-3d-viewer.tsx`
- **Purpose**: Provides tabbed interface for different rendering modes
- **Features**: Mode detection, capability display, automatic fallback

#### 3. WebRTC Graph Viewer
- **File**: `frontend/components/webrtc-graph-viewer.tsx`
- **Purpose**: Handles WebRTC streaming visualization
- **Features**: Real-time frame streaming, session management, auto-refresh

### Server-Side Service

#### Remote WebGPU Clustering Service
- **File**: `services/remote_webgpu_clustering_service.py`
- **Purpose**: GPU-accelerated clustering and WebRTC streaming
- **Technologies**: FastAPI, RAPIDS cuGraph, OpenCV, Plotly

### Key Features

1. **Automatic Fallback Detection**
   ```typescript
   // Automatically detects best available mode
   const engine = new EnhancedWebGPUClusteringEngine([32, 18, 24]);
   if (engine.isUsingRemote()) {
     console.log("Using remote GPU clustering");
   }
   ```

2. **GPU-Accelerated Clustering**
   ```python
   # Server-side clustering with cuGraph
   df = cudf.DataFrame(node_data)
   cluster_indices = compute_clusters_gpu(df)
   ```

3. **WebRTC Streaming**
   ```python
   # Real-time graph rendering and streaming
   fig = create_3d_plotly_graph(nodes, links)
   img_bytes = pio.to_image(fig, format='png')
   ```

## 🎮 User Experience

### Automatic Mode Selection

The system intelligently selects the best rendering mode:

1. **Local WebGPU Available**: Uses local GPU for best performance
2. **Remote Service Available**: Falls back to hybrid mode
3. **WebRTC Capable**: Offers streaming mode for poor client hardware

### Visual Indicators

- **Green Badge**: Local WebGPU active
- **Blue Badge**: Remote GPU clustering
- **Orange Badge**: WebRTC streaming
- **Live Indicator**: Real-time streaming status

## 📊 Performance Characteristics

### Local WebGPU Mode
- ✅ **Best Performance**: No network latency
- ✅ **Full Interactivity**: Real-time manipulation
- ❌ **Limited Availability**: Requires WebGPU support

### Hybrid GPU/CPU Mode  
- ✅ **Good Performance**: GPU clustering, CPU rendering
- ✅ **Wide Compatibility**: Works on most browsers
- ⚠️ **Network Dependent**: Initial clustering requires network

### WebRTC Streaming Mode
- ✅ **Universal Compatibility**: Works on any browser
- ✅ **Server-Side GPU**: Full GPU acceleration
- ❌ **Network Intensive**: Requires good bandwidth

## 🔍 Monitoring and Debugging

### Service Health Monitoring

```bash
# Check service health
curl http://localhost:8083/health

# Response
{
  "status": "healthy",
  "gpu_available": true,
  "webrtc_available": true,
  "active_sessions": 0,
  "active_connections": 1
}
```

### Client-Side Debugging

The enhanced viewer provides detailed status information:

- Connection status to remote service
- Available rendering modes
- GPU acceleration capabilities
- Real-time performance metrics

### Server-Side Logs

```bash
# View service logs
docker logs txt2kg-remote-webgpu

# Example output
INFO:     Remote WebGPU clustering engine initialized with 13824 clusters
INFO:     ✓ RAPIDS cuGraph/cuDF/cuML available for remote WebGPU clustering
INFO:     ✓ OpenCV available for WebRTC streaming
INFO:     Starting Remote WebGPU Clustering Service on port 8083
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Not Available**
   ```bash
   # Ensure service is running
   docker ps | grep remote-webgpu
   
   # Check service logs
   docker logs txt2kg-remote-webgpu
   ```

2. **WebGPU Detection Failed**
   - Check browser WebGPU support: `chrome://gpu`
   - Ensure hardware acceleration is enabled
   - Try different browser (Chrome/Edge recommended)

3. **WebRTC Streaming Issues**
   - Verify network connectivity to port 8083
   - Check browser console for CORS errors
   - Ensure sufficient bandwidth for image streaming

### GPU Requirements

- **NVIDIA GPU**: Required for server-side acceleration
- **CUDA 12.0+**: Compatible CUDA toolkit
- **RAPIDS 23.12+**: cuGraph and cuDF libraries

## 🔮 Future Enhancements

1. **Multi-GPU Support**: Distribute clustering across multiple GPUs
2. **Adaptive Quality**: Adjust streaming quality based on network conditions
3. **Caching Layer**: Cache clustering results for repeated visualizations
4. **Mobile Optimization**: Optimize WebRTC streaming for mobile devices

## 📚 Related Documentation

- [WebGPU Clustering Utils](../frontend/utils/webgpu-clustering.ts)
- [PyGraphistry Integration](./pygraphistry-integration.md)
- [GPU Accelerated Visualization](../frontend/docs/gpu-accelerated-visualization.md)

## 🤝 Contributing

When contributing to the remote WebGPU clustering feature:

1. Test all three rendering modes
2. Verify GPU detection logic
3. Check WebSocket connection handling
4. Ensure proper cleanup of resources
5. Test with various graph sizes (100-10k+ nodes)

This feature represents a significant advancement in making GPU-accelerated graph visualization accessible to remote and constrained environments while maintaining high performance and user experience.

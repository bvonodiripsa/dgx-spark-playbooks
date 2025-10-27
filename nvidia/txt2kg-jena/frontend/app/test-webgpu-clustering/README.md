# WebGPU Clustering Performance Test Page

## 🎯 Purpose

This test page is specifically designed to evaluate the performance of remote WebGPU clustering with large-scale graphs (up to 500K nodes). It demonstrates the benefits of GPU acceleration for 3D graph visualization in remote browser environments.

## 🚀 Features

### Graph Generation
- **Configurable Node Count**: 1K to 500K nodes
- **Adjustable Link Density**: 0.001% to 0.1% 
- **Multiple Graph Types**:
  - **Random**: Uniformly distributed nodes
  - **Scale-Free**: Power-law degree distribution (realistic networks)
  - **Small-World**: Clustered communities with bridges
  - **Hierarchical**: Tree-like structure with levels

### Performance Testing
- **Real-time Metrics**: Generation time, clustering time, memory usage
- **Comparative Analysis**: Local WebGPU vs Remote GPU clustering
- **Mode Selection**: Standard 3D vs Enhanced WebGPU viewer
- **Memory Estimation**: Helps prevent browser crashes

## 📊 Recommended Test Configurations

### Small Scale (Verification)
```
Nodes: 10,000
Density: 0.01%
Type: Scale-Free
Purpose: Verify setup and basic functionality
```

### Medium Scale (Performance Baseline)
```
Nodes: 50,000
Density: 0.005%
Type: Small-World
Purpose: Compare local vs remote performance
```

### Large Scale (Stress Test)
```
Nodes: 100,000
Density: 0.001%
Type: Scale-Free
Purpose: Demonstrate remote WebGPU benefits
```

### Extreme Scale (GPU Requirement)
```
Nodes: 500,000
Density: 0.0001%
Type: Hierarchical
Purpose: WebRTC streaming necessity
```

## 🎮 Usage Instructions

### 1. Access the Test Page
- Navigate to `/test-webgpu-clustering`
- Or click the "⚡ WebGPU Test" button from the main graph viewer

### 2. Configure Test Parameters
1. **Set Node Count**: Use slider (recommended: 100K)
2. **Adjust Link Density**: Lower for larger graphs
3. **Choose Graph Type**: Scale-free is most realistic
4. **Enable Options**: 3D visualization and GPU clustering

### 3. Generate Test Graph
- Click "Generate Test Graph"
- Monitor generation time and memory usage
- Wait for completion before visualization

### 4. Test Rendering Modes
- **Standard 3D**: Traditional ForceGraph3D with local WebGPU
- **Enhanced WebGPU**: Multi-mode viewer with remote fallback
- Compare performance between modes

## 📈 Performance Expectations

### Local WebGPU (Best Case)
- **10K nodes**: < 100ms clustering, smooth interaction
- **50K nodes**: < 500ms clustering, good performance
- **100K+ nodes**: May struggle or fail

### Remote Hybrid Mode
- **10K nodes**: ~200ms clustering, excellent rendering
- **50K nodes**: ~800ms clustering, good performance
- **100K nodes**: ~2s clustering, acceptable performance

### WebRTC Streaming Mode
- **Any size**: Server-side processing, consistent client performance
- **Network dependent**: Requires good bandwidth for smooth streaming
- **Universal compatibility**: Works on any browser

## 🔧 Technical Details

### Graph Generation Algorithm
```typescript
// Scale-free network generation
const r = Math.pow(Math.random(), 0.5) * 300
const theta = Math.random() * 2 * Math.PI
const phi = Math.acos(2 * Math.random() - 1)
x = r * Math.sin(phi) * Math.cos(theta)
y = r * Math.sin(phi) * Math.sin(theta)  
z = r * Math.cos(phi)
```

### Memory Estimation
```typescript
// Approximate memory usage calculation
const estimatedMemoryMB = Math.round(
  (nodeCount * 200 + nodeCount * linkDensity * 100) / 1024
)
```

### Performance Metrics Tracked
- **Generation Time**: Time to create graph data structure
- **Clustering Time**: GPU clustering computation time
- **Rendering Time**: Initial visualization setup time
- **Memory Usage**: Browser memory consumption

## 🚨 Important Notes

### Browser Limitations
- **Memory**: Large graphs may crash browsers with insufficient RAM
- **WebGPU**: Not all browsers support WebGPU (Chrome/Edge recommended)
- **Performance**: Varies significantly by hardware

### Network Requirements
- **Hybrid Mode**: Low latency preferred, moderate bandwidth
- **WebRTC Mode**: Good bandwidth required (>10 Mbps recommended)
- **Local Mode**: No network dependency

### GPU Requirements
- **Server**: NVIDIA GPU with CUDA support required for remote modes
- **Client**: Any GPU for local WebGPU, none required for remote modes

## 🎯 Testing Scenarios

### Scenario 1: Local vs Remote Comparison
1. Generate 50K node scale-free graph
2. Test with standard 3D view (local WebGPU)
3. Switch to enhanced WebGPU view (remote hybrid)
4. Compare clustering times and interaction smoothness

### Scenario 2: Network Constraint Testing
1. Generate 100K node graph
2. Test hybrid mode with good network
3. Test WebRTC streaming mode
4. Compare visual quality and responsiveness

### Scenario 3: Scalability Testing
1. Start with 10K nodes, increase gradually
2. Find the breaking point for local WebGPU
3. Demonstrate remote WebGPU handling larger graphs
4. Test maximum practical size with WebRTC streaming

## 📊 Expected Results

### Performance Scaling
- **Local WebGPU**: Linear degradation, fails at ~100K nodes
- **Remote Hybrid**: Better scaling, works up to 200K+ nodes
- **WebRTC Streaming**: Consistent performance regardless of graph size

### Quality Comparison
- **Local**: Highest quality, real-time interaction
- **Hybrid**: High quality rendering, slight clustering delay
- **WebRTC**: Good quality, network-dependent smoothness

This test page demonstrates the practical benefits of remote WebGPU clustering for large-scale graph visualization, particularly in environments where local WebGPU support is limited or unavailable.

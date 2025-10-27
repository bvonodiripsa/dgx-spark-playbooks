# vLLM Integration for txt2kg

This document describes the vLLM integration added to txt2kg, which provides high-performance local LLM inference with NVfp4 quantization support for optimal GPU utilization.

## Overview

The vLLM integration provides:
- High-performance local LLM inference using vLLM's built-in OpenAI API server
- NVfp4 quantization for efficient GPU memory usage
- Support for multiple Llama models (3.2, 3.1 series)
- Full OpenAI API compatibility for seamless integration
- Advanced features like tensor parallelism and CUDA graphs
- No API key requirements for local processing
- Simple, single-process deployment

## Prerequisites

### Hardware Requirements
- NVIDIA GPU with compute capability 7.0+ (RTX 20 series or newer)
- At least 8GB GPU memory (16GB+ recommended for larger models)
- CUDA 11.8+ or 12.1+

### Software Requirements
- Docker with NVIDIA Container Runtime
- NVIDIA drivers 525.60.13+
- Docker Compose v2.0+

## Quick Start

### 1. Using Docker Compose

Start the complete stack with vLLM:

```bash
cd deploy/compose
docker-compose -f docker-compose.vllm.yml up -d
```

This will start:
- vLLM service with Llama 3.2 3B model
- ArangoDB for graph storage
- Sentence Transformers for embeddings
- Pinecone local index for vector storage
- Main txt2kg application

### 2. Verify vLLM Service

Check if vLLM is running:

```bash
curl http://localhost:8001/v1/models
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "meta-llama/Llama-3.2-3B-Instruct",
      "object": "model",
      "created": 1234567890,
      "owned_by": "vllm"
    }
  ]
}
```

### 3. Test Model Inference

Test the vLLM API directly:

```bash
curl -X POST http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.2-3B-Instruct",
    "messages": [
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "temperature": 0.7,
    "max_tokens": 100
  }'
```

## Configuration

### Environment Variables

Configure vLLM through environment variables:

```bash
# Model configuration
VLLM_MODEL=meta-llama/Llama-3.2-3B-Instruct
VLLM_TENSOR_PARALLEL_SIZE=1
VLLM_MAX_MODEL_LEN=4096
VLLM_GPU_MEMORY_UTILIZATION=0.9

# NVfp4 quantization settings
VLLM_QUANTIZATION=fp8
VLLM_KV_CACHE_DTYPE=fp8

# Service configuration
VLLM_PORT=8001
VLLM_HOST=0.0.0.0
```

### Supported Models

The integration supports various Llama models with NVfp4 quantization:

#### Llama 3.2 Series
- `meta-llama/Llama-3.2-1B-Instruct` (Recommended for 8GB GPU)
- `meta-llama/Llama-3.2-3B-Instruct` (Recommended for 12GB+ GPU)

#### Llama 3.1 Series
- `meta-llama/Llama-3.1-8B-Instruct` (Requires 16GB+ GPU)

### Frontend Configuration

The model selector includes vLLM options:
- vLLM Llama 3.2 3B (NVfp4)
- vLLM Llama 3.2 1B (NVfp4)
- vLLM Llama 3.1 8B (NVfp4)

## API Endpoints

### Health Check: `GET /api/vllm?action=test-connection`

Tests connection to vLLM server and retrieves model information.

```bash
curl http://localhost:3000/api/vllm?action=test-connection
```

Response:
```json
{
  "connected": true,
  "health": {
    "status": "healthy",
    "service": "vllm",
    "note": "Using vLLM's built-in OpenAI API server"
  },
  "models": ["meta-llama/Llama-3.2-3B-Instruct"],
  "baseUrl": "http://localhost:8001/v1"
}
```

### Extract Triples: `POST /api/vllm`

Extract triples using vLLM model directly.

```bash
curl -X POST http://localhost:3000/api/vllm \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Apple Inc. is headquartered in Cupertino, California.",
    "model": "meta-llama/Llama-3.2-3B-Instruct",
    "temperature": 0.1,
    "maxTokens": 1024
  }'
```

### Unified Extraction: `POST /api/extract-triples`

Use vLLM through the unified extraction endpoint:

```bash
curl -X POST http://localhost:3000/api/extract-triples \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Apple Inc. is headquartered in Cupertino, California.",
    "llmProvider": "vllm",
    "vllmModel": "meta-llama/Llama-3.2-3B-Instruct"
  }'
```

## Performance Optimization

### NVfp4 Quantization

The integration uses NVfp4 (FP8) quantization for optimal performance:

- **Memory Efficiency**: Reduces model memory usage by ~50%
- **Speed**: Maintains high inference speed
- **Quality**: Minimal impact on model quality
- **Hardware Support**: Optimized for modern NVIDIA GPUs

### GPU Memory Management

Configure GPU memory utilization based on your hardware:

```bash
# For 8GB GPU (conservative)
VLLM_GPU_MEMORY_UTILIZATION=0.8

# For 16GB+ GPU (aggressive)
VLLM_GPU_MEMORY_UTILIZATION=0.95
```

### Tensor Parallelism

For multi-GPU setups:

```bash
# Use 2 GPUs
VLLM_TENSOR_PARALLEL_SIZE=2
CUDA_VISIBLE_DEVICES=0,1
```

## Troubleshooting

### Common Issues

#### 1. GPU Memory Issues
```
OutOfMemoryError: CUDA out of memory
```

**Solutions:**
- Reduce `VLLM_GPU_MEMORY_UTILIZATION` to 0.7-0.8
- Use a smaller model (Llama 3.2 1B instead of 3B)
- Reduce `VLLM_MAX_MODEL_LEN`

#### 2. Model Loading Timeout
```
Health check failed: timeout
```

**Solutions:**
- Increase Docker health check timeout
- Ensure stable internet connection for model download
- Pre-download models to local cache

#### 3. Quantization Not Supported
```
Quantization 'fp8' is not supported
```

**Solutions:**
- Update to latest NVIDIA drivers
- Use `VLLM_QUANTIZATION=auto` for automatic selection
- Fall back to `VLLM_QUANTIZATION=awq` if available

### Monitoring

Monitor vLLM performance:

```bash
# Check GPU usage
nvidia-smi

# Check vLLM logs
docker logs vllm-service

# Monitor inference metrics
curl http://localhost:8001/metrics
```

## Advanced Configuration

### Custom Model Configuration

To use a custom model:

1. Update the environment variables:
```bash
VLLM_MODEL=your-custom-model
```

2. Ensure the model supports the chat template format
3. Adjust memory settings accordingly

### Production Deployment

For production use:

1. **Resource Limits**: Set appropriate Docker resource limits
2. **Monitoring**: Implement comprehensive monitoring
3. **Load Balancing**: Use multiple vLLM instances behind a load balancer
4. **Model Caching**: Pre-warm model cache for faster startup

### Integration with txt2kg Pipeline

The vLLM service integrates seamlessly with the txt2kg pipeline:

1. **LangChain Integration**: Supports LangChain's ChatOpenAI interface
2. **Structured Output**: Optimized prompts for triple extraction
3. **Batch Processing**: Efficient handling of multiple documents
4. **Error Handling**: Robust error handling and retry logic

## Comparison with Other Providers

| Feature | vLLM | Ollama | NVIDIA API |
|---------|------|--------|------------|
| Performance | Highest | Medium | High |
| Memory Efficiency | Excellent (NVfp4) | Good | N/A |
| Local Processing | ✅ | ✅ | ❌ |
| API Key Required | ❌ | ❌ | ✅ |
| GPU Optimization | Advanced | Basic | N/A |
| Model Variety | Moderate | High | High |
| Setup Complexity | Medium | Low | Low |

## Contributing

To contribute to the vLLM integration:

1. Test new models and quantization methods
2. Optimize performance for different GPU configurations
3. Improve error handling and monitoring
4. Add support for new vLLM features

## References

- [vLLM Documentation](https://docs.vllm.ai/)
- [NVIDIA NVfp4 Quantization](https://developer.nvidia.com/blog/fp8-formats-for-deep-learning/)
- [Llama Model Cards](https://huggingface.co/meta-llama)
- [Docker NVIDIA Runtime](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

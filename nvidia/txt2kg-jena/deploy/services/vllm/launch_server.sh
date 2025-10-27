#!/bin/bash

# Launch vLLM with NVIDIA Triton Inference Server optimized build
# This should have proper support for compute capability 12.1 (DGX Spark)

# Enable unified memory usage for DGX Spark
export CUDA_MANAGED_FORCE_DEVICE_ALLOC=1

# Force vLLM to ignore memory checks for unified memory systems
export VLLM_ALLOW_RUNTIME_LORA_UPDATES_WITH_SGD_LORA=1
export VLLM_SKIP_WARMUP=1

# Optimized environment for performance
export VLLM_LOGGING_LEVEL=INFO
export PYTHONUNBUFFERED=1

# Enable CUDA optimizations
export VLLM_USE_MODELSCOPE=false

# First, test basic CUDA functionality
echo "=== Testing CUDA functionality ==="
python3 -c "
import torch
print(f'PyTorch version: {torch.__version__}')
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'CUDA version: {torch.version.cuda}')
    print(f'GPU count: {torch.cuda.device_count()}')
    for i in range(torch.cuda.device_count()):
        props = torch.cuda.get_device_properties(i)
        print(f'GPU {i}: {props.name} (compute capability {props.major}.{props.minor})')
        # Try basic CUDA operation
        try:
            x = torch.randn(10, 10).cuda(i)
            y = torch.matmul(x, x.T)
            print(f'GPU {i}: Basic CUDA operations work')
        except Exception as e:
            print(f'GPU {i}: CUDA operation failed: {e}')
"

echo "=== Starting optimized vLLM server ==="
# Optimized configuration for DGX Spark performance with NVFP4 quantization
# Available quantized models from NVIDIA
NVFP4_MODEL="nvidia/Llama-3.3-70B-Instruct-FP4"
NVFP8_MODEL="nvidia/Llama-3.1-8B-Instruct-FP8"
STANDARD_MODEL="meta-llama/Llama-3.1-8B-Instruct"

# Check GPU compute capability for optimal quantization
COMPUTE_CAPABILITY=$(nvidia-smi -i 0 --query-gpu=compute_cap --format=csv,noheader,nounits 2>/dev/null || echo "unknown")
echo "Detected GPU compute capability: $COMPUTE_CAPABILITY"

# Configure quantization based on GPU architecture
if [[ "$COMPUTE_CAPABILITY" == "12.1" ]] || [[ "$COMPUTE_CAPABILITY" == "10.0" ]]; then
    # Blackwell/DGX Spark architecture - use NVFP8 quantized model with enhanced config
    echo "Enabling NVFP8 quantized model (Llama-3.1-8B) with enhanced configuration for Blackwell/DGX Spark"
    QUANTIZATION_FLAG=""  # No explicit quantization flag needed for pre-quantized models
    MODEL_TO_USE="$NVFP8_MODEL"  # Use NVIDIA's pre-quantized FP8 model (8B)
    GPU_MEMORY_UTIL="0.9"  # High memory utilization with FP8 quantization
    MAX_MODEL_LEN="8192"   # Long sequences enabled by quantization
    MAX_NUM_SEQS="64"      # High concurrent sequences with memory savings
    MAX_BATCHED_TOKENS="8192"
elif [[ "$COMPUTE_CAPABILITY" == "9.0" ]]; then
    # Hopper architecture - use FP8 quantized model
    echo "Enabling FP8 quantized model for Hopper architecture"
    QUANTIZATION_FLAG=""
    MODEL_TO_USE="$NVFP8_MODEL"
    GPU_MEMORY_UTIL="0.8"
    MAX_MODEL_LEN="3072"
    MAX_NUM_SEQS="48"
    MAX_BATCHED_TOKENS="3072"
else
    # Other architectures - use standard precision
    echo "Using standard precision for GPU architecture: $COMPUTE_CAPABILITY"
    QUANTIZATION_FLAG=""
    MODEL_TO_USE="$STANDARD_MODEL"
    GPU_MEMORY_UTIL="0.8"
    MAX_MODEL_LEN="2048"
    MAX_NUM_SEQS="32"
    MAX_BATCHED_TOKENS="2048"
fi

echo "Using model: $MODEL_TO_USE"
echo "Quantization: ${QUANTIZATION_FLAG:-'disabled'}"
echo "GPU memory utilization: $GPU_MEMORY_UTIL"

vllm serve "$MODEL_TO_USE" \
  --host 0.0.0.0 \
  --port 8001 \
  --tensor-parallel-size 1 \
  --max-model-len "$MAX_MODEL_LEN" \
  --max-num-seqs "$MAX_NUM_SEQS" \
  --max-num-batched-tokens "$MAX_BATCHED_TOKENS" \
  --gpu-memory-utilization "$GPU_MEMORY_UTIL" \
  --kv-cache-dtype auto \
  --trust-remote-code \
  --served-model-name "$MODEL_TO_USE" \
  --enable-chunked-prefill \
  --disable-custom-all-reduce \
  --disable-async-output-proc \
  $QUANTIZATION_FLAG
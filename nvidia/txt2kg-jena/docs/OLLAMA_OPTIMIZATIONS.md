# Ollama Performance Optimizations

This document describes the performance optimizations implemented for Ollama integration in txt2kg.

## 🚀 Optimizations Implemented

### 1. Connection Pooling
- **HTTP Keep-Alive**: Reuses connections to reduce handshake overhead
- **Connection Pool Configuration**:
  - Ollama (local): 15 max sockets, 8 free sockets
  - NVIDIA API: 10 max sockets, 5 free sockets
- **Timeout Management**: 60-second timeout with 30-second keep-alive

### 2. Request Batching
- **Parallel Processing**: Process multiple texts simultaneously
- **Controlled Concurrency**: Configurable concurrency limits
  - Ollama: Default 5 concurrent requests
  - NVIDIA API: Default 3 concurrent requests (rate limiting)
- **Batch Size Limits**: Maximum 100 texts per batch

### 3. Retry Logic with Exponential Backoff
- **Automatic Retries**: Up to 3 attempts per request
- **Exponential Backoff**: Increasing delays between retries
- **Jitter**: Random delay component to prevent thundering herd
- **Detailed Error Tracking**: Tracks attempts and failure reasons

## 📊 Performance Benefits

### Expected Improvements
- **Latency Reduction**: 20-30% improvement from connection pooling
- **Throughput Increase**: 3-5x improvement for batch operations
- **Reliability**: Better handling of transient failures
- **Resource Efficiency**: Reduced connection overhead

### Benchmark Results
Run the test script to see actual performance improvements:

```bash
cd frontend/utils
node test_optimizations.js http://localhost:3000 10
```

## 🔧 API Endpoints

### New Batch Processing Endpoint
```
POST /api/ollama/batch
```

**Request Body:**
```json
{
  "texts": ["text1", "text2", "..."],
  "model": "qwen3:1.7b",
  "temperature": 0.1,
  "maxTokens": 8192,
  "concurrency": 5
}
```

**Response:**
```json
{
  "results": [...],
  "summary": {
    "totalTexts": 10,
    "successfulTexts": 9,
    "failedTexts": 1,
    "totalTriples": 45,
    "averageTriples": "5.00"
  },
  "batchInfo": {
    "model": "qwen3:1.7b",
    "concurrency": 5,
    "method": "ollama_batch"
  },
  "errors": [...]
}
```

## 🛠️ Configuration Options

### Environment Variables
```bash
# Ollama configuration
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen3:1.7b

# Performance tuning
OLLAMA_MAX_SOCKETS=15
OLLAMA_CONCURRENCY=5
```

### Runtime Configuration
```typescript
// Batch processing options
const options: BatchOptions = {
  concurrency: 5,        // Parallel requests
  temperature: 0.1,      // Model temperature
  maxTokens: 8192,       // Max response tokens
  maxRetries: 3          // Retry attempts
};
```

## 📈 Usage Examples

### Single Text Processing (Existing)
```javascript
const response = await fetch('/api/ollama', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Apple Inc. is headquartered in Cupertino.",
    model: 'qwen3:1.7b'
  })
});
```

### Batch Text Processing (New)
```javascript
const response = await fetch('/api/ollama/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    texts: [
      "Apple Inc. is headquartered in Cupertino.",
      "Microsoft was founded by Bill Gates.",
      "Google specializes in internet services."
    ],
    model: 'qwen3:1.7b',
    concurrency: 3
  })
});
```

## 🧪 Testing the Optimizations

### Performance Test Script
```bash
# Test with 5 texts (default)
node frontend/utils/test_optimizations.js

# Test with custom number of texts
node frontend/utils/test_optimizations.js http://localhost:3000 20

# Test with different server
node frontend/utils/test_optimizations.js http://your-server:3000 10
```

### Expected Output
```
🚀 Testing Ollama Optimizations
=================================
Base URL: http://localhost:3000
Number of texts: 5

0. Testing Ollama Connection...
   ✅ Ollama connection successful
   📋 Available models: qwen3:1.7b, llama3.2

1. Testing Single Processing (Sequential)...
   ✅ Single processing completed in 15420ms
   📊 Success rate: 5/5
   🔗 Total triples: 23

2. Testing Batch Processing...
   ✅ Batch processing completed in 4180ms
   📊 Success rate: 5/5
   🔗 Total triples: 23
   🔄 Average attempts per text: 1.2

📈 Performance Comparison
========================
⏱️  Single processing: 15420ms
⏱️  Batch processing:  4180ms
🚀 Speed improvement: 3.69x faster
💾 Time saved: 11240ms (72.9%)
```

## 🔍 Monitoring and Debugging

### Console Logging
The optimized service provides detailed logging:
- Connection pool status
- Batch processing progress
- Retry attempts and failures
- Performance metrics

### Error Handling
- Graceful degradation on failures
- Detailed error reporting with retry counts
- Partial success handling in batch operations

## 🎯 Best Practices

### For Remote Server Usage
1. **Use Batch Processing**: For multiple texts, always use the batch endpoint
2. **Tune Concurrency**: Start with conservative values (3-5) and adjust based on server capacity
3. **Monitor Errors**: Check retry counts and adjust timeout/retry settings if needed
4. **Connection Pooling**: Benefits are automatic - no configuration needed

### For High-Volume Processing
1. **Batch Size**: Keep batches under 100 texts for optimal memory usage
2. **Concurrency Limits**: Don't exceed Ollama server capacity
3. **Error Recovery**: Implement application-level retry for critical operations
4. **Resource Monitoring**: Monitor server CPU/memory usage during batch operations

## 🔧 Troubleshooting

### Common Issues

1. **Connection Pool Exhaustion**
   - Symptom: Timeouts after initial requests
   - Solution: Reduce concurrency or increase pool size

2. **High Memory Usage**
   - Symptom: Server memory increases during batch processing
   - Solution: Reduce batch size or add delays between batches

3. **Retry Loops**
   - Symptom: Excessive retry attempts
   - Solution: Check Ollama server health and reduce retry count

### Performance Tuning
- Monitor average attempts per request
- Adjust concurrency based on success rates
- Use smaller batches for memory-constrained environments
- Consider model size vs. speed tradeoffs

## 🚀 Future Enhancements

Potential additional optimizations:
- Response streaming for real-time feedback
- Intelligent batching based on text length
- Circuit breaker pattern for failing servers
- Metrics collection and performance dashboards
- GPU memory management for local deployments

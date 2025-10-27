# Ollama Integration for txt2kg

This document describes the Ollama integration added to txt2kg, which enables local LLM processing for triple extraction without requiring external API keys.

## Overview

The Ollama integration provides:
- Local LLM processing using Ollama server
- Support for multiple Ollama models (Llama 3.2, Llama 3.1, Mistral, etc.)
- Triple extraction from documents using local models
- No API key requirements
- Offline processing capabilities

## Prerequisites

1. **Install Ollama**
   - Visit [ollama.com](https://ollama.com) for installation instructions
   - Or use: `curl -fsSL https://ollama.com/install.sh | sh` (Linux/macOS)

2. **Start Ollama Server**
   ```bash
   ollama serve
   ```

3. **Pull Required Models**
   ```bash
   # Recommended models for triple extraction
   ollama pull llama3.2
   ollama pull llama3.1
   ollama pull mistral
   ```

## Configuration

### Environment Variables

You can configure Ollama settings using environment variables:

```bash
# Optional: Custom Ollama server URL (default: http://localhost:11434/v1)
OLLAMA_BASE_URL=http://localhost:11434/v1

# Optional: Default model to use (default: llama3.2)
OLLAMA_MODEL=llama3.2
```

### Frontend Configuration

The model selector now includes Ollama options:
- Ollama Llama 3.2
- Ollama Llama 3.1  
- Ollama Mistral

## API Endpoints

### Test Connection: `GET /api/ollama`

Tests connection to Ollama server and lists available models.

```bash
curl http://localhost:3000/api/ollama?action=test-connection
```

Response:
```json
{
  "connected": true,
  "models": ["llama3.2", "llama3.1", "mistral"]
}
```

### Extract Triples: `POST /api/ollama`

Extract triples using Ollama model directly.

```bash
curl -X POST http://localhost:3000/api/ollama \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Apple Inc. is headquartered in Cupertino, California.",
    "model": "llama3.2",
    "temperature": 0.1,
    "maxTokens": 1024
  }'
```

### Unified Extraction: `POST /api/extract-triples`

Use Ollama through the unified extraction API.

```bash
curl -X POST http://localhost:3000/api/extract-triples \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Apple Inc. is headquartered in Cupertino, California.",
    "llmProvider": "ollama",
    "ollamaModel": "llama3.2"
  }'
```

## Frontend Components

### Model Selector

The `ModelSelector` component now includes Ollama models with server icons and appropriate descriptions.

### Ollama Connection Component

A new `OllamaConnection` component provides:
- Connection testing
- Model listing
- Configuration management
- Status monitoring

```tsx
import { OllamaConnection } from "@/components/ollama-connection"

<OllamaConnection 
  onConnectionChange={(connected, models) => {
    console.log('Ollama connection:', connected, models)
  }} 
/>
```

## Backend Services

### LLM Service Updates

The `LLMService` class now supports:
- `generateOllamaCompletion()` - Generate completions using Ollama
- `generateOllamaCompletionStream()` - Streaming completions
- `testOllamaConnection()` - Test connection and list models

### LangChain Service Updates

The `LangChainService` now includes:
- `getOllamaModel()` - Create ChatOpenAI instance for Ollama models
- Automatic model caching
- Connection testing

### Text Processor Updates

The `TextProcessor` supports:
- Dynamic LLM provider selection
- Ollama model configuration
- Provider-specific error messages

## Testing

### Automated Test

Run the integration test script:

```bash
node test_ollama_integration.js
```

Or with custom base URL:
```bash
node test_ollama_integration.js http://localhost:3000
```

### Manual Testing

1. **Test Connection**
   ```bash
   curl http://localhost:3000/api/ollama/test
   ```

2. **Test Triple Extraction**
   - Use the frontend model selector to choose an Ollama model
   - Upload a document and process it
   - Verify triples are extracted using the local model

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Ensure Ollama is installed and running: `ollama serve`
   - Check if the service is accessible: `curl http://localhost:11434/api/tags`
   - Verify firewall settings

2. **No Models Available**
   - Pull at least one model: `ollama pull llama3.2`
   - List available models: `ollama list`

3. **Slow Processing**
   - Ollama models run locally and may be slower than cloud APIs
   - Consider using smaller models for faster processing
   - Ensure sufficient system resources (RAM/CPU)

4. **Memory Issues**
   - Large models require significant RAM
   - Consider using quantized models
   - Monitor system memory usage

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=ollama:*
```

## Model Recommendations

### For Triple Extraction

1. **Llama 3.2** (Recommended)
   - Good balance of speed and accuracy
   - Optimized for instruction following
   - Moderate resource requirements

2. **Llama 3.1**
   - Higher accuracy for complex texts
   - Larger context window
   - Higher resource requirements

3. **Mistral**
   - Fast processing
   - Good for simple extractions
   - Lower resource requirements

### Resource Requirements

| Model | RAM Required | Speed | Accuracy |
|-------|-------------|-------|----------|
| Llama 3.2 | 8GB+ | Medium | High |
| Llama 3.1 | 16GB+ | Slow | Very High |
| Mistral | 4GB+ | Fast | Medium |

## Integration with Existing Features

The Ollama integration works seamlessly with:
- Document processing pipeline
- Graph visualization
- Triple editing
- Export/import functionality
- RAG queries (when configured)

## Future Enhancements

Planned improvements:
- Model auto-detection
- Performance optimization
- Custom model support
- Batch processing
- GPU acceleration support

## Support

For issues specific to Ollama integration:
1. Check Ollama server status
2. Verify model availability
3. Review console logs
4. Test with the provided test script

For general Ollama support, visit [ollama.com](https://ollama.com).

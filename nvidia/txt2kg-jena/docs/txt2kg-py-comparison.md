# Comparison with txt2kg.py

This document outlines the differences between our current web-based implementation and the original txt2kg.py library.

## Core Functionality Present

Both implementations share these core capabilities:
- Text chunking implementation
- Triple extraction with LLM integration
- Knowledge graph visualization
- Document management and processing pipeline
- Triple editing and management interface
- Remote backend with embeddings and graph storage
- RAG query processing with configurable parameters

## Key Differences

| Feature | txt2kg.py Library | Web Implementation |
|---------|-------------------|-------------------|
| Format | Python library | Web application with UI |
| Deployment | Local Python execution | Docker Compose with services |
| LLM Models | Various local options | NVIDIA NeMo models (Llama 3.1 70B and Mixtral 8×7B) via API |
| Visualization | Basic visualization | Enhanced 2D/3D interactive visualization |
| Persistence | Basic storage | Multiple storage options (Neo4j, ArangoDB, Pinecone) |
| UI | Command-line based | Modern web interface with dark/light theme |

## Additional Features in Our Web Implementation

The web implementation extends the original library with several improvements:
- Web-based UI with dark/light theme support
- Interactive graph visualization with both 2D and 3D options
- Document management system with history
- Neo4j integration for graph database storage
- Pinecone integration for vector embeddings
- Enhanced triple editing interface
- Multiple LLM provider support through unified LLMService
- Query logging and performance metrics dashboards
- Docker Compose deployment configuration
- S3-compatible storage integration
- WebGPU-accelerated clustering for large graph visualization
- Fallback mechanism between localStorage and database storage

## Implementation Details

### Text Processing
The web implementation (`lib/text-processor.ts`) includes:
- RecursiveCharacterTextSplitter for chunking
- LLM-powered triple extraction with confidence scoring
- Entity normalization and relationship mapping
- Enhanced metadata handling

### Graph Visualization
Our implementation adds:
- Force-directed graph visualization with physics
- Interactive node exploration and selection
- 3D visualization with WebGL acceleration
- Node clustering for large graphs
- Search and filtering capabilities

### Database Integration
The web version provides flexible backend options:
- Neo4j graph database for complex queries
- ArangoDB for graph and document storage
- Pinecone for vector search
- Local storage fallback for offline capability 
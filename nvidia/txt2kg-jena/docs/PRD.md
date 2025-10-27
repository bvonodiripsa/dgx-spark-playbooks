# txt2kg: Knowledge Graph Generation & Visualization

## 1. Executive Summary

txt2kg is a comprehensive knowledge graph generation and visualization solution that transforms unstructured documents into interactive, explorable knowledge graphs. The application provides end-to-end capabilities from document upload to graph-based reasoning using NVIDIA AI technology.

## 2. Product Architecture

### 2.1 Technology Stack
- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Graph Visualization**: 3D Force Graph with custom force-directed physics
- **State Management**: React Context API
- **Databases**: 
  - Vector Database (Pinecone) for entity embeddings and KNN search
  - Graph Databases (Neo4j, ArangoDB) for relationship querying
- **AI Models**: NVIDIA NeMo Models (Llama 3.1 70B)
- **Deployment**: Docker Compose with multiple configuration options

### 2.2 Core Components

#### Document Processing Pipeline
- Document upload supporting markdown, text, and CSV files
- Text chunking with RecursiveCharacterTextSplitter
- Triple extraction with structure and confidence scoring
- S3-compatible storage integration for document management

#### Knowledge Graph Management
- Triple preprocessing (lowercase normalization, deduplication)
- Entity embedding generation via Text Embeddings Inference API
- Triple and entity editing interface with confidence scoring
- Graph export/import functionality
- Persistent storage with localStorage fallback

#### Visualization System
- 2D and 3D interactive graph visualization
- Node selection and exploration capabilities
- WebGPU-accelerated clustering for large graphs
- Force-directed layout with configurable parameters

#### Query & Analysis
- RAG query system with configurable parameters
- KNN-based retrieval with neighborhood sampling
- Graph analysis tools:
  - Network metrics calculations
  - Semantic-based node scoring
  - PCST algorithm for subgraph filtering
- Query logging and performance metrics dashboard

### 2.3 API Services

#### EmbeddingsService
- Text Embeddings Inference API with Alibaba-NLP/gte-modernbert-base model
- Batched processing for efficient embedding generation
- Cosine similarity calculations for entity matching

#### LLMService
- Unified interface for accessing different LLM providers
- NVIDIA NeMo model integration via OpenAI compatibility layer
- Configurable parameters for model behavior

#### Backend Services
- Remote backend integrating Neo4j, Pinecone, and EmbeddingsService
- Complete RAG pipeline implementation
- API endpoints for backend management and query processing

## 3. Deployment Options

- **Standard**: ArangoDB + Next.js + Pinecone + Text Embeddings API
- **Neo4j**: Neo4j Graph DB + Next.js + Pinecone + Text Embeddings API
- **GNN**: Graph Neural Network support + standard components

## 4. Implementation Status

### 4.1 Completed Features
- Document upload and processing pipeline
- Triple extraction with multiple LLM options
- Interactive graph visualization components
- Triple and entity editing interface
- Model selection and configuration
- RAG query system with configurable parameters
- Vector and graph database integrations
- Docker Compose deployment
- S3-compatible storage integration
- Advanced graph analysis tools
- WebGPU-accelerated clustering

### 4.2 Feature Roadmap

#### Must Have ✅
- Document upload and processing
- Text chunking and triple extraction using LLM
- 2D graph visualization
- Interactive graph exploration
- Triple editing functionality
- Model selection for different LLMs

#### Should Have ✅
- Local Docker deployment
- Integration with Neo4j
- Graph export/import functionality
- Persistent storage with localStorage fallback
- API integration for triple extraction
- Triple preprocessing and normalization
- Sentence embedding integration
- RAG query processing with configurable parameters

#### Could Have
- Offline LLM support via Ollama ⬜
- Convert docs to markdown using markitdown ⬜
- Graph analytics for entity centrality and clustering ⬜
- ArangoDB integration for GraphRAG ✅
- Dark/Light theme support ✅
- S3-compatible storage integration ✅
- Advanced graph analysis tools ✅
- KNN-based triple retrieval ✅
- Performance statistics dashboard ✅

#### Won't Have
- Mobile optimization for graph visualization ⬜
- Real-time collaborative editing ⬜
- Multi-user account system ⬜

## 5. Related Documentation

- [NVIDIA NeMo Retriever Comparison](nemo-comparison.md)
- [txt2kg.py Comparison](txt2kg-py-comparison.md)

## 6. Future Improvements

### Code Structure Improvements
1. Standardize folder structure
2. Modularize large components
3. Implement feature folders
4. Add automated testing
5. Document code architecture
6. Standardize error handling
7. Consolidate environment configuration

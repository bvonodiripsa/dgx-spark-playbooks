# Apache Jena Fuseki Integration Guide

## Overview

This guide covers the Apache Jena Fuseki integration in txt2kg, providing SPARQL-based graph data storage and querying capabilities. Apache Jena Fuseki is a SPARQL server that provides REST-style SPARQL HTTP Update, SPARQL Query, and SPARQL Update using the SPARQL protocol over HTTP.

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [SPARQL Examples](#sparql-examples)
- [API Integration](#api-integration)
- [Performance Tuning](#performance-tuning)
- [Troubleshooting](#troubleshooting)
- [Migration Guide](#migration-guide)

## Features

### Core Capabilities
- **SPARQL 1.1 Support**: Full query, update, and federation support
- **TDB2 Storage**: High-performance, ACID-compliant triple store
- **RESTful API**: Standard SPARQL protocol endpoints
- **Web Admin Interface**: Easy dataset management and monitoring
- **Authentication**: Optional HTTP basic authentication
- **Transaction Support**: Full ACID transaction support
- **Backup & Recovery**: Built-in dataset backup and restore

### Integration Benefits
- **Semantic Web Standards**: Native RDF and SPARQL support
- **Flexible Querying**: Complex graph traversal and pattern matching
- **Inference Support**: Optional reasoning capabilities
- **Interoperability**: Standard RDF formats (Turtle, JSON-LD, N-Triples)
- **Scalability**: Optimized for large-scale graph data

## Quick Start

### 1. Basic Deployment

```bash
# Deploy with Apache Jena Fuseki
./start.sh --jena
```

### 2. Access Points

- **Main Application**: http://localhost:3001
- **Fuseki SPARQL Endpoint**: http://localhost:3030
- **Admin Interface**: http://localhost:3030/dataset.html
- **Dataset**: `txt2kg` (default)

### 3. First Steps

1. Access the main application at http://localhost:3001
2. Upload documents through the UI
3. Extract knowledge triples
4. Query the graph using the built-in interface
5. Access raw SPARQL endpoint for custom queries

## Configuration

### Environment Variables

```bash
# Apache Jena Fuseki Configuration
JENA_ENDPOINT=http://localhost:3030        # Fuseki server endpoint
JENA_DATASET=txt2kg                        # Dataset name
JENA_USERNAME=admin                        # Optional: HTTP basic auth username
JENA_PASSWORD=admin                        # Optional: HTTP basic auth password

# Java/JVM Options (optional)
JAVA_OPTIONS=-Xmx2g -Xms1g -Dfuseki.cors.enabled=true
```

### Docker Configuration

The Jena deployment uses the `secoresearch/fuseki:latest` Docker image with the following configuration:

```yaml
jena-fuseki:
  image: secoresearch/fuseki:latest
  ports:
    - '3030:3030'
  environment:
    - ADMIN_PASSWORD=${JENA_PASSWORD:-admin}
    - FUSEKI_DATASET_1=txt2kg
    - FUSEKI_DATASET_2=test
    - JAVA_OPTIONS=-Xmx2g -Xms1g -Dfuseki.cors.enabled=true
  volumes:
    - jena_data:/fuseki/databases
    - jena_config:/fuseki/configuration
```

### Frontend Configuration

The frontend automatically detects and configures Jena when selected in the settings:

1. Open Settings → Graph Database
2. Select "Apache Jena Fuseki"
3. Configure endpoint and credentials
4. Save configuration

## Architecture

### Data Model

txt2kg stores knowledge graphs in Jena using the following RDF structure:

```turtle
# Prefixes
@prefix ex:     <http://example.org/> .
@prefix txt2kg: <http://txt2kg.example.org/> .
@prefix rdfs:   <http://www.w3.org/2000/01/rdf-schema#> .
@prefix rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .

# Entity declarations
ex:entity_John_Doe rdf:type txt2kg:Entity ;
                   rdfs:label "John Doe" .

ex:entity_Apple_Inc rdf:type txt2kg:Entity ;
                    rdfs:label "Apple Inc" .

# Relationships
ex:entity_John_Doe ex:works_at ex:entity_Apple_Inc .
```

### Service Integration

```typescript
// JenaService integration points
class JenaService {
  // SPARQL Query execution
  executeSparqlQuery(query: string): Promise<any>
  
  // SPARQL Update execution  
  executeSparqlUpdate(update: string): Promise<void>
  
  // Triple import from txt2kg format
  importTriples(triples: Triple[]): Promise<void>
  
  // Graph data export
  getGraphData(): Promise<GraphData>
  
  // Query logging and metrics
  logQuery(query: string, metrics: QueryMetrics): Promise<void>
}
```

## SPARQL Examples

### Basic Queries

#### 1. Get All Entities

```sparql
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?entity ?label WHERE {
  ?entity a txt2kg:Entity ;
          rdfs:label ?label .
}
```

#### 2. Find Relationships

```sparql
PREFIX ex: <http://example.org/>
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?subject ?predicate ?object ?subjectLabel ?objectLabel WHERE {
  ?subject ?predicate ?object .
  ?subject a txt2kg:Entity ;
           rdfs:label ?subjectLabel .
  ?object a txt2kg:Entity ;
          rdfs:label ?objectLabel .
  FILTER(?predicate != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
  FILTER(?predicate != rdfs:label)
}
```

#### 3. Entity Neighborhood

```sparql
PREFIX ex: <http://example.org/>
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?neighbor ?relationship ?direction WHERE {
  {
    ex:entity_John_Doe ?relationship ?neighbor .
    ?neighbor a txt2kg:Entity .
    BIND("outgoing" AS ?direction)
  }
  UNION
  {
    ?neighbor ?relationship ex:entity_John_Doe .
    ?neighbor a txt2kg:Entity .
    BIND("incoming" AS ?direction)
  }
  FILTER(?relationship != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
  FILTER(?relationship != rdfs:label)
}
```

### Advanced Queries

#### 4. Graph Analytics - Node Degree

```sparql
PREFIX ex: <http://example.org/>
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?entity ?label (COUNT(?connection) AS ?degree) WHERE {
  ?entity a txt2kg:Entity ;
          rdfs:label ?label .
  {
    ?entity ?p ?connection .
    ?connection a txt2kg:Entity .
  }
  UNION
  {
    ?connection ?p ?entity .
    ?connection a txt2kg:Entity .
  }
  FILTER(?p != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
  FILTER(?p != rdfs:label)
}
GROUP BY ?entity ?label
ORDER BY DESC(?degree)
```

#### 5. Path Finding (2-hop paths)

```sparql
PREFIX ex: <http://example.org/>
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?startLabel ?middleLabel ?endLabel ?rel1 ?rel2 WHERE {
  ex:entity_John_Doe rdfs:label ?startLabel .
  ex:entity_John_Doe ?rel1 ?middle .
  ?middle ?rel2 ?end .
  ?middle a txt2kg:Entity ;
          rdfs:label ?middleLabel .
  ?end a txt2kg:Entity ;
       rdfs:label ?endLabel .
  FILTER(?rel1 != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
  FILTER(?rel1 != rdfs:label)
  FILTER(?rel2 != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>)
  FILTER(?rel2 != rdfs:label)
  FILTER(?middle != ?end)
}
```

### Update Operations

#### 6. Insert New Triples

```sparql
PREFIX ex: <http://example.org/>
PREFIX txt2kg: <http://txt2kg.example.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

INSERT DATA {
  ex:entity_New_Person a txt2kg:Entity ;
                       rdfs:label "New Person" .
  ex:entity_New_Person ex:knows ex:entity_John_Doe .
}
```

#### 7. Delete Triples

```sparql
PREFIX ex: <http://example.org/>

DELETE DATA {
  ex:entity_John_Doe ex:works_at ex:entity_Apple_Inc .
}
```

## API Integration

### Direct SPARQL Endpoint Usage

```javascript
// Query endpoint
const queryResponse = await fetch('http://localhost:3030/txt2kg/sparql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/sparql-results+json',
    'Authorization': 'Basic ' + btoa('admin:admin') // if auth enabled
  },
  body: sparqlQuery
});

// Update endpoint
const updateResponse = await fetch('http://localhost:3030/txt2kg/update', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/sparql-update',
    'Authorization': 'Basic ' + btoa('admin:admin') // if auth enabled
  },
  body: sparqlUpdate
});
```

### Using the JenaService

```typescript
import { JenaService } from '@/lib/jena';

const jenaService = JenaService.getInstance();
jenaService.initialize('http://localhost:3030', 'txt2kg', 'admin', 'admin');

// Execute query
const results = await jenaService.executeSparqlQuery(`
  SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10
`);

// Import triples
await jenaService.importTriples([
  { subject: 'John Doe', predicate: 'works at', object: 'Apple Inc' },
  { subject: 'Apple Inc', predicate: 'founded by', object: 'Steve Jobs' }
]);

// Get graph data for visualization
const graphData = await jenaService.getGraphData();
```

## Performance Tuning

### JVM Settings

Optimize Java Virtual Machine settings for your workload:

```bash
# Memory settings
JAVA_OPTIONS="-Xmx4g -Xms2g"

# Garbage collection
JAVA_OPTIONS="${JAVA_OPTIONS} -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

# TDB2 specific optimizations
JAVA_OPTIONS="${JAVA_OPTIONS} -Dtdb2.block_size=8192"
```

### Query Optimization

1. **Use LIMIT**: Always limit results for exploratory queries
2. **Filter Early**: Apply filters as early as possible in queries
3. **Index Usage**: Leverage automatic indexing in TDB2
4. **Batch Updates**: Group multiple updates in transactions

```sparql
# Good: Filter early and limit results
SELECT ?entity ?label WHERE {
  ?entity a txt2kg:Entity .
  FILTER(CONTAINS(LCASE(?label), "apple"))
  ?entity rdfs:label ?label .
}
LIMIT 100

# Bad: No filters or limits
SELECT ?s ?p ?o WHERE { ?s ?p ?o }
```

### Dataset Management

```bash
# Backup dataset
curl -X POST "http://localhost:3030/$/backup/txt2kg"

# Compact database (offline operation)
docker exec jena-fuseki tdb2.tdbcompact --loc=/fuseki/databases/txt2kg

# Statistics (helps query optimization)
curl "http://localhost:3030/$/stats/txt2kg"
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused

**Problem**: Cannot connect to Fuseki server
**Solution**: 
```bash
# Check if container is running
docker ps | grep jena-fuseki

# Check logs
docker logs jena-fuseki

# Restart service
docker restart jena-fuseki
```

#### 2. Dataset Not Found

**Problem**: 404 errors when querying dataset
**Solution**:
```bash
# List available datasets
curl http://localhost:3030/$/datasets

# Create dataset manually
curl -X POST "http://localhost:3030/$/datasets" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "dbName=txt2kg&dbType=tdb2" \
     --user admin:admin
```

#### 3. Memory Issues

**Problem**: OutOfMemoryError or slow performance
**Solution**:
```bash
# Increase memory allocation
JAVA_OPTIONS="-Xmx8g -Xms4g"

# Monitor memory usage
curl http://localhost:3030/$/server
```

#### 4. Authentication Failures

**Problem**: 401/403 errors
**Solution**:
```bash
# Check environment variables
echo $JENA_USERNAME
echo $JENA_PASSWORD

# Test authentication
curl -u admin:admin http://localhost:3030/$/server
```

### Performance Debugging

#### Query Analysis

```sparql
# Enable query logging in Fuseki
# Add to fuseki configuration:
[] rdf:type fuseki:Server ;
   fuseki:services (
     <#service1>
   ) ;
   fuseki:queryTimeout 30000 ;
   fuseki:enableVerboseLogging true .
```

#### Monitor Resource Usage

```bash
# Container resource usage
docker stats jena-fuseki

# Disk usage
docker exec jena-fuseki du -sh /fuseki/databases/txt2kg

# Query statistics
curl http://localhost:3030/$/stats/txt2kg
```

## Migration Guide

### From Neo4j to Jena

```typescript
// Export Neo4j data
const neo4jData = await neo4jService.getGraphData();

// Transform to triples
const triples = neo4jData.relationships.map(rel => ({
  subject: neo4jData.nodes.find(n => n.id === rel.source)?.name || rel.source,
  predicate: rel.type,
  object: neo4jData.nodes.find(n => n.id === rel.target)?.name || rel.target
}));

// Import to Jena
await jenaService.importTriples(triples);
```

### From ArangoDB to Jena

```typescript
// Export ArangoDB data
const arangoData = await arangoService.getGraphData();

// Transform and import (similar to Neo4j example above)
const triples = transformToTriples(arangoData);
await jenaService.importTriples(triples);
```

### Bulk Data Import

For large datasets, use Jena's bulk loading tools:

```bash
# Convert CSV to Turtle
docker exec jena-fuseki riot --formatted=TURTLE data.csv > data.ttl

# Load into TDB2
docker exec jena-fuseki tdb2.tdbloader --loc=/fuseki/databases/txt2kg data.ttl
```

## Advanced Configuration

### Custom Ontologies

```turtle
# Define custom vocabulary
@prefix myonto: <http://mycompany.com/ontology/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

myonto:Person a rdfs:Class ;
              rdfs:label "Person" .

myonto:worksAt a rdf:Property ;
               rdfs:domain myonto:Person ;
               rdfs:range myonto:Organization .
```

### Inference Rules

```bash
# Enable built-in reasoner
# Add to dataset configuration:
<#dataset> rdf:type tdb2:DatasetTDB2 ;
          tdb2:location "/fuseki/databases/txt2kg" ;
          ja:reasoner [
            ja:reasonerURL <http://jena.hpl.hp.com/2003/RDFSExptRuleReasoner>
          ] .
```

### Federation Queries

```sparql
# Query multiple SPARQL endpoints
PREFIX fedx: <http://www.fluidops.com/config/fedx#>

SELECT ?s ?p ?o WHERE {
  SERVICE <http://localhost:3030/txt2kg/sparql> {
    ?s ?p ?o .
  }
  SERVICE <http://external-endpoint/sparql> {
    ?s ?external_p ?external_o .
  }
}
```

## Best Practices

### Data Modeling
1. Use meaningful URIs and prefixes
2. Follow RDF/RDFS conventions
3. Implement consistent naming patterns
4. Document your vocabulary/ontology

### Query Writing
1. Use appropriate query forms (SELECT, CONSTRUCT, ASK, DESCRIBE)
2. Optimize with FILTER placement
3. Use OPTIONAL carefully (can be expensive)
4. Consider query complexity and timeout limits

### System Administration
1. Regular backups of datasets
2. Monitor disk space and memory usage
3. Set appropriate timeouts
4. Implement proper authentication
5. Keep Jena Fuseki updated

### Integration
1. Handle errors gracefully
2. Implement retry logic for network calls
3. Cache frequently used queries
4. Use connection pooling for high-volume applications

## Resources

- [Apache Jena Documentation](https://jena.apache.org/documentation/)
- [SPARQL 1.1 Specification](https://www.w3.org/TR/sparql11-overview/)
- [Fuseki Configuration](https://jena.apache.org/documentation/fuseki2/fuseki-configuration.html)
- [TDB2 Documentation](https://jena.apache.org/documentation/tdb2/)
- [RDF 1.1 Concepts](https://www.w3.org/TR/rdf11-concepts/)

## Support

For issues specific to the txt2kg Jena integration:
1. Check the troubleshooting section above
2. Review Fuseki logs: `docker logs jena-fuseki`
3. Test with direct SPARQL queries
4. Check resource usage and performance metrics

For general Apache Jena issues, consult the official documentation and community resources.

// Using built-in fetch in Node.js 18+

/**
 * Apache Jena Fuseki service for SPARQL-based graph database operations
 * Provides methods to connect to and interact with a Jena Fuseki server
 */
export class JenaService {
    private fusekiEndpoint: string | null = null;
    private username: string | undefined;
    private password: string | undefined;
    private static instance: JenaService;
    private datasetName: string = 'txt2kg';

    private constructor() { }

    /**
     * Get the singleton instance of JenaService
     */
    public static getInstance(): JenaService {
        if (!JenaService.instance) {
            JenaService.instance = new JenaService();
        }
        return JenaService.instance;
    }

    /**
     * Initialize the Jena Fuseki connection
     * @param endpoint - Fuseki server endpoint (defaults to JENA_ENDPOINT env var or 'http://localhost:3030')
     * @param datasetName - Dataset name (defaults to JENA_DATASET env var or 'txt2kg')
     * @param username - Fuseki username (optional)
     * @param password - Fuseki password (optional)
     */
    public initialize(endpoint?: string, datasetName?: string, username?: string, password?: string): void {
        // Use provided endpoint, or environment variable, or default to localhost
        this.fusekiEndpoint = endpoint || process.env.JENA_ENDPOINT || 'http://localhost:3030';
        this.datasetName = datasetName || process.env.JENA_DATASET || 'txt2kg';
        this.username = username || process.env.JENA_USERNAME;
        this.password = password || process.env.JENA_PASSWORD;

        // Ensure endpoint doesn't end with slash
        if (this.fusekiEndpoint.endsWith('/')) {
            this.fusekiEndpoint = this.fusekiEndpoint.slice(0, -1);
        }

        console.log(`Jena Fuseki initialized: ${this.fusekiEndpoint}/${this.datasetName}`);
    }

    /**
     * Check if the service is initialized
     */
    public isInitialized(): boolean {
        return this.fusekiEndpoint !== null;
    }

    /**
     * Get authentication headers if credentials are provided
     */
    private getAuthHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/sparql-query',
            'Accept': 'application/sparql-results+json'
        };

        if (this.username && this.password) {
            const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
        }

        return headers;
    }

    /**
     * Execute a SPARQL query
     * @param sparqlQuery - SPARQL query string
     * @param queryType - Type of query (SELECT, CONSTRUCT, ASK, DESCRIBE)
     * @returns Promise resolving to query results
     */
    public async executeSparqlQuery(sparqlQuery: string, queryType: string = 'SELECT'): Promise<any> {
        if (!this.fusekiEndpoint) {
            throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
        }

        const queryEndpoint = `${this.fusekiEndpoint}/${this.datasetName}/sparql`;
        const headers = this.getAuthHeaders();

        try {
            console.log(`[Jena] Executing SPARQL query on ${queryEndpoint}`);
            console.log(`[Jena] Query: ${sparqlQuery}`);

            const response = await fetch(queryEndpoint, {
                method: 'POST',
                headers,
                body: sparqlQuery
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`[Jena] SPARQL query failed: ${response.status} ${response.statusText}`);
                throw new Error(`SPARQL query failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const contentType = response.headers.get('content-type');
            console.log(`[Jena] Response content-type: ${contentType}`);

            let result;
            if (contentType?.includes('application/json') || contentType?.includes('sparql-results+json')) {
                result = await response.json();
                console.log(`[Jena] JSON response received:`, JSON.stringify(result, null, 2));
                return result;
            } else {
                result = await response.text();
                console.log(`[Jena] Text response received: ${result}`);
                return result;
            }
        } catch (error) {
            console.error('[Jena] Error executing SPARQL query:', error);
            throw error;
        }
    }

    /**
     * Execute a SPARQL update query
     * @param updateQuery - SPARQL update query string
     * @returns Promise resolving when update is complete
     */
    public async executeSparqlUpdate(updateQuery: string): Promise<void> {
        if (!this.fusekiEndpoint) {
            throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
        }

        const updateEndpoint = `${this.fusekiEndpoint}/${this.datasetName}/update`;
        const headers = {
            ...this.getAuthHeaders(),
            'Content-Type': 'application/sparql-update'
        };

        try {
            const response = await fetch(updateEndpoint, {
                method: 'POST',
                headers,
                body: updateQuery
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`SPARQL update failed: ${response.status} ${response.statusText} - ${errorText}`);
            }
        } catch (error) {
            console.error('Error executing SPARQL update:', error);
            throw error;
        }
    }

    /**
     * Import triples (subject, predicate, object) into the graph database
     * @param triples - Array of triples to import
     * @returns Promise resolving when import is complete
     */
    public async importTriples(triples: { subject: string; predicate: string; object: string }[]): Promise<void> {
        if (!this.fusekiEndpoint) {
            throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
        }

        // Create namespace prefixes
        const prefixes = `
      PREFIX ex: <http://example.org/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX txt2kg: <http://txt2kg.example.org/>
    `;

        // Build SPARQL INSERT DATA query in batches to avoid overly large queries
        const batchSize = 100;
        let successCount = 0;

        for (let i = 0; i < triples.length; i += batchSize) {
            const batch = triples.slice(i, i + batchSize);

            let insertData = prefixes + '\nINSERT DATA {\n';

            for (const triple of batch) {
                // Normalize and validate triple values
                const normalizedSubject = triple.subject.trim();
                const normalizedPredicate = triple.predicate.trim();
                const normalizedObject = triple.object.trim();

                // Skip invalid triples
                if (!normalizedSubject || !normalizedPredicate || !normalizedObject) {
                    console.warn('Skipping invalid triple:', triple);
                    continue;
                }

                // Escape quotes and special characters
                const escapeValue = (value: string) => {
                    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
                };

                // Create URIs for entities and predicates
                const subjectUri = this.createEntityUri(escapeValue(normalizedSubject));
                const predicateUri = this.createPredicateUri(escapeValue(normalizedPredicate));
                const objectUri = this.createEntityUri(escapeValue(normalizedObject));

                // Add triples to the INSERT DATA statement
                insertData += `  ${subjectUri} rdf:type txt2kg:Entity .\n`;
                insertData += `  ${objectUri} rdf:type txt2kg:Entity .\n`;
                insertData += `  ${subjectUri} rdfs:label "${escapeValue(normalizedSubject)}" .\n`;
                insertData += `  ${objectUri} rdfs:label "${escapeValue(normalizedObject)}" .\n`;
                insertData += `  ${subjectUri} ${predicateUri} ${objectUri} .\n\n`;
            }

            insertData += '}';

            try {
                await this.executeSparqlUpdate(insertData);
                successCount += batch.length;
            } catch (error) {
                console.error(`Failed to import batch ${i / batchSize + 1}:`, error);
                throw error;
            }
        }

        console.log(`Successfully imported ${successCount} triples into Jena Fuseki`);
    }

    /**
     * Create a URI for an entity
     * @param entityName - Name of the entity
     * @returns URI string
     */
    private createEntityUri(entityName: string): string {
        // Create a URI-safe version of the entity name
        const safeName = entityName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
        return `ex:entity_${safeName}`;
    }

    /**
     * Create a URI for a predicate/relationship
     * @param predicateName - Name of the predicate
     * @returns URI string
     */
    private createPredicateUri(predicateName: string): string {
        // Create a URI-safe version of the predicate name
        const safeName = predicateName.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
        return `ex:${safeName}`;
    }

    /**
     * Get all nodes and relationships from the database
     * @returns Promise resolving to nodes and relationships
     */
    public async getGraphData(): Promise<{
        nodes: Array<{
            id: string;
            labels: string[];
            [key: string]: any
        }>;
        relationships: Array<{
            id: string;
            source: string;
            target: string;
            type: string;
            [key: string]: any
        }>;
    }> {
        if (!this.fusekiEndpoint) {
            throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
        }

        const prefixes = `
      PREFIX ex: <http://example.org/>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX txt2kg: <http://txt2kg.example.org/>
    `;

        try {
            // Get all entities (nodes)
            const entitiesQuery = prefixes + `
        SELECT DISTINCT ?entity ?label WHERE {
          ?entity rdf:type txt2kg:Entity .
          ?entity rdfs:label ?label .
        }
      `;

            const entitiesResult = await this.executeSparqlQuery(entitiesQuery);
            console.log(`[Jena] Entities query result:`, entitiesResult);

            // Check if the result has the expected structure
            if (!entitiesResult || typeof entitiesResult !== 'object') {
                console.warn(`[Jena] Invalid entities query result:`, entitiesResult);
                return { nodes: [], relationships: [] };
            }

            if (!entitiesResult.results || typeof entitiesResult.results !== 'object') {
                console.warn(`[Jena] Missing results in entities query:`, entitiesResult);
                return { nodes: [], relationships: [] };
            }

            if (!Array.isArray(entitiesResult.results.bindings)) {
                console.warn(`[Jena] Invalid bindings structure:`, entitiesResult.results);
                return { nodes: [], relationships: [] };
            }

            const nodes = entitiesResult.results.bindings.map((binding: any, index: number) => ({
                id: `node_${index}`,
                uri: binding.entity.value,
                name: binding.label.value,
                labels: ['Entity']
            }));

            // Create URI to ID mapping
            const uriToId = new Map<string, string>();
            nodes.forEach(node => {
                uriToId.set(node.uri, node.id);
            });

            // Get all relationships
            const relationshipsQuery = prefixes + `
        SELECT DISTINCT ?subject ?predicate ?object ?subjectLabel ?objectLabel WHERE {
          ?subject ?predicate ?object .
          ?subject rdf:type txt2kg:Entity .
          ?object rdf:type txt2kg:Entity .
          ?subject rdfs:label ?subjectLabel .
          ?object rdfs:label ?objectLabel .
          FILTER(?predicate != rdf:type && ?predicate != rdfs:label)
        }
      `;

            const relationshipsResult = await this.executeSparqlQuery(relationshipsQuery);
            console.log(`[Jena] Relationships query result:`, relationshipsResult);

            // Check if the result has the expected structure
            if (!relationshipsResult || !relationshipsResult.results || !relationshipsResult.results.bindings) {
                console.warn(`[Jena] Unexpected relationships query result structure:`, relationshipsResult);
                return { nodes, relationships: [] };
            }

            const relationships = relationshipsResult.results.bindings.map((binding: any, index: number) => {
                const subjectId = uriToId.get(binding.subject.value);
                const objectId = uriToId.get(binding.object.value);

                // Extract predicate name from URI
                const predicateUri = binding.predicate.value;
                const predicateName = predicateUri.includes('#')
                    ? predicateUri.split('#').pop()
                    : predicateUri.split('/').pop() || 'RELATED_TO';

                return {
                    id: `rel_${index}`,
                    source: subjectId,
                    target: objectId,
                    type: predicateName.replace(/^ex:/, '').replace(/_/g, ' '),
                    sourceLabel: binding.subjectLabel.value,
                    targetLabel: binding.objectLabel.value
                };
            }).filter(rel => rel.source && rel.target); // Filter out relationships with missing nodes

            return { nodes, relationships };
        } catch (error) {
            console.error('Error fetching graph data from Jena Fuseki:', error);
            console.error('Returning empty graph data as fallback');
            // Return empty results to prevent UI crashes
            return { nodes: [], relationships: [] };
        }
    }

    /**
     * Log a RAG query with its performance metrics
     * @param query The user's query string
     * @param queryMode The query mode used (traditional, vector-search, pure-rag)
     * @param metrics Performance metrics for the query
     */
    public async logQuery(
        query: string,
        queryMode: 'traditional' | 'vector-search' | 'pure-rag',
        metrics: {
            executionTimeMs: number;
            relevanceScore?: number;
            precision?: number;
            recall?: number;
            resultCount: number;
        }
    ): Promise<void> {
        if (!this.fusekiEndpoint) {
            console.error('Jena Fuseki service not initialized for logQuery. Attempting to initialize...');
            this.initialize();
            if (!this.fusekiEndpoint) {
                console.error('Failed to initialize Jena Fuseki service for logQuery');
                throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
            }
        }

        console.log(`[Jena] Logging query: "${query}" (${queryMode})`);
        console.log(`[Jena] Query metrics:`, JSON.stringify(metrics));

        const prefixes = `
      PREFIX ex: <http://example.org/>
      PREFIX txt2kg: <http://txt2kg.example.org/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    `;

        try {
            // Create a unique URI for this query log
            const timestamp = new Date().toISOString();
            const queryId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const executionId = `execution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const insertQuery = prefixes + `
        INSERT DATA {
          ex:${queryId} a txt2kg:QueryLog ;
            txt2kg:queryText "${query.replace(/"/g, '\\"')}" ;
            txt2kg:timestamp "${timestamp}"^^xsd:dateTime .
          
          ex:${executionId} a txt2kg:QueryExecution ;
            txt2kg:queryMode "${queryMode}" ;
            txt2kg:executionTimeMs "${metrics.executionTimeMs}"^^xsd:double ;
            txt2kg:resultCount "${metrics.resultCount}"^^xsd:integer ;
            txt2kg:timestamp "${timestamp}"^^xsd:dateTime .
          
          ex:${queryId} txt2kg:hasExecution ex:${executionId} .
        }
      `;

            // Add optional metrics if available
            let optionalMetrics = '';
            if (metrics.relevanceScore !== undefined) {
                optionalMetrics += `ex:${executionId} txt2kg:relevanceScore "${metrics.relevanceScore}"^^xsd:double .\n`;
            }
            if (metrics.precision !== undefined) {
                optionalMetrics += `ex:${executionId} txt2kg:precision "${metrics.precision}"^^xsd:double .\n`;
            }
            if (metrics.recall !== undefined) {
                optionalMetrics += `ex:${executionId} txt2kg:recall "${metrics.recall}"^^xsd:double .\n`;
            }

            if (optionalMetrics) {
                const finalQuery = insertQuery.replace('}', optionalMetrics + '}');
                await this.executeSparqlUpdate(finalQuery);
            } else {
                await this.executeSparqlUpdate(insertQuery);
            }

            console.log(`[Jena] Query logged successfully`);
        } catch (error) {
            console.error('[Jena] Error logging query:', error);
            // Non-critical error, so just log it but don't throw
        }
    }

    /**
     * Get query logs with performance metrics
     * @param limit Maximum number of query logs to return
     * @returns Promise resolving to an array of query logs
     */
    public async getQueryLogs(limit: number = 100): Promise<any[]> {
        if (!this.fusekiEndpoint) {
            console.error('Jena Fuseki service not initialized for getQueryLogs. Attempting to initialize...');
            this.initialize();
            if (!this.fusekiEndpoint) {
                console.error('Failed to initialize Jena Fuseki service for getQueryLogs');
                throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
            }
        }

        console.log(`[Jena] Getting query logs with limit: ${limit}`);

        const prefixes = `
      PREFIX ex: <http://example.org/>
      PREFIX txt2kg: <http://txt2kg.example.org/>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    `;

        try {
            const queryLogsQuery = prefixes + `
        SELECT ?query ?queryMode ?executionTimeMs ?relevanceScore ?precision ?recall ?resultCount ?timestamp
        WHERE {
          ?queryLog a txt2kg:QueryLog ;
            txt2kg:queryText ?query ;
            txt2kg:hasExecution ?execution .
          
          ?execution a txt2kg:QueryExecution ;
            txt2kg:queryMode ?queryMode ;
            txt2kg:executionTimeMs ?executionTimeMs ;
            txt2kg:resultCount ?resultCount ;
            txt2kg:timestamp ?timestamp .
          
          OPTIONAL { ?execution txt2kg:relevanceScore ?relevanceScore }
          OPTIONAL { ?execution txt2kg:precision ?precision }
          OPTIONAL { ?execution txt2kg:recall ?recall }
        }
        ORDER BY DESC(?timestamp)
        LIMIT ${limit}
      `;

            console.log(`[Jena] Executing SPARQL query for getQueryLogs`);

            const result = await this.executeSparqlQuery(queryLogsQuery);

            console.log(`[Jena] Retrieved ${result.results.bindings.length} query logs`);

            return result.results.bindings.map((binding: any) => ({
                query: binding.query.value,
                queryMode: binding.queryMode.value,
                timestamp: binding.timestamp.value,
                metrics: {
                    executionTimeMs: parseFloat(binding.executionTimeMs.value),
                    relevanceScore: binding.relevanceScore ? parseFloat(binding.relevanceScore.value) : undefined,
                    precision: binding.precision ? parseFloat(binding.precision.value) : undefined,
                    recall: binding.recall ? parseFloat(binding.recall.value) : undefined,
                    resultCount: parseInt(binding.resultCount.value)
                }
            }));
        } catch (error) {
            console.error('[Jena] Error getting query logs:', error);
            return [];
        }
    }

    /**
     * Get information about the Fuseki connection
     * @returns Object with connection info
     */
    public getDriverInfo(): Record<string, any> {
        if (!this.fusekiEndpoint) {
            return {
                connected: false,
                message: 'Service not initialized'
            };
        }

        return {
            connected: true,
            endpoint: this.fusekiEndpoint,
            dataset: this.datasetName,
            hasAuth: !!(this.username && this.password)
        };
    }

    /**
     * Clear all data from the graph database
     * @returns Promise resolving when the database is cleared
     */
    public async clearDatabase(): Promise<void> {
        if (!this.fusekiEndpoint) {
            throw new Error('Jena Fuseki service not initialized. Call initialize() first.');
        }

        try {
            // Delete all triples in the dataset
            const clearQuery = 'CLEAR ALL';
            await this.executeSparqlUpdate(clearQuery);
            console.log('Jena Fuseki database cleared successfully');
        } catch (error) {
            console.error('Error clearing Jena Fuseki database:', error);
            throw error;
        }
    }

    /**
     * Close the connection (cleanup method)
     */
    public close(): void {
        this.fusekiEndpoint = null;
        this.username = undefined;
        this.password = undefined;
        console.log('Jena Fuseki service connection closed');
    }

    /**
     * Creates a test query log entry for debugging
     * @param query The query text
     * @returns Promise that resolves when the operation is complete
     */
    public async createTestQueryLog(query: string): Promise<void> {
        return this.logQuery(
            query,
            'traditional',
            {
                executionTimeMs: 0,
                relevanceScore: 0,
                precision: 0,
                recall: 0,
                resultCount: 0
            }
        );
    }
}

export default JenaService.getInstance();

import { GraphDBService, GraphDBType } from './graph-db-service';
import { Neo4jService } from './neo4j';
import { ArangoDBService } from './arangodb';
import { JenaService } from './jena';

/**
 * Get the appropriate graph database service based on the graph database type.
 * This is useful for API routes that need direct access to a specific graph database.
 * 
 * @param graphDbType - The type of graph database to use
 */
export function getGraphDbService(graphDbType?: GraphDBType) {
  const dbType = graphDbType || (process.env.DEFAULT_GRAPH_DB_TYPE as GraphDBType) || 'arangodb';

  if (dbType === 'neo4j') {
    return Neo4jService.getInstance();
  } else if (dbType === 'arangodb') {
    return ArangoDBService.getInstance();
  } else if (dbType === 'jena') {
    return JenaService.getInstance();
  } else {
    // Default to ArangoDB
    return ArangoDBService.getInstance();
  }
}

/**
 * Initialize the graph database directly (not using GraphDBService).
 * This is useful for API routes that need direct access to a specific graph database.
 * 
 * @param graphDbType - The type of graph database to use
 */
export async function initializeGraphDb(graphDbType?: GraphDBType): Promise<void> {
  const dbType = graphDbType || (process.env.DEFAULT_GRAPH_DB_TYPE as GraphDBType) || 'arangodb';
  const service = getGraphDbService(dbType);

  if (dbType === 'neo4j') {
    // Get Neo4j credentials from environment
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USER || process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    // Initialize Neo4j connection
    if (service instanceof Neo4jService) {
      service.initialize(uri, username, password);
    }
  } else if (dbType === 'arangodb') {
    // Get ArangoDB credentials from environment
    const url = process.env.ARANGODB_URL;
    const dbName = process.env.ARANGODB_DB;
    const username = process.env.ARANGODB_USER;
    const password = process.env.ARANGODB_PASSWORD;

    // Initialize ArangoDB connection
    if (service instanceof ArangoDBService) {
      await service.initialize(url, dbName, username, password);
    }
  } else if (dbType === 'jena') {
    // Get Jena Fuseki credentials from environment
    const endpoint = process.env.JENA_ENDPOINT;
    const dataset = process.env.JENA_DATASET;
    const username = process.env.JENA_USERNAME;
    const password = process.env.JENA_PASSWORD;

    // Initialize Jena Fuseki connection
    if (service instanceof JenaService) {
      service.initialize(endpoint, dataset, username, password);
    }
  }
} 
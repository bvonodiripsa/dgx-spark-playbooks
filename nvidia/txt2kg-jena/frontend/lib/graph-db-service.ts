import { Neo4jService } from './neo4j';
import { ArangoDBService } from './arangodb';
import { JenaService } from './jena';
import type { Triple } from '@/types/graph';

export type GraphDBType = 'neo4j' | 'arangodb' | 'jena';

/**
 * GraphDBService that provides a unified interface for different graph database implementations
 */
export class GraphDBService {
  private neo4jService: Neo4jService;
  private arangoDBService: ArangoDBService;
  private jenaService: JenaService;
  private activeDBType: GraphDBType = (process.env.DEFAULT_GRAPH_DB_TYPE as GraphDBType) || 'arangodb'; // Default based on environment
  private static instance: GraphDBService;

  private constructor() {
    this.neo4jService = Neo4jService.getInstance();
    this.arangoDBService = ArangoDBService.getInstance();
    this.jenaService = JenaService.getInstance();
  }

  /**
   * Get the singleton instance of GraphDBService
   */
  public static getInstance(): GraphDBService {
    if (!GraphDBService.instance) {
      GraphDBService.instance = new GraphDBService();
    }
    return GraphDBService.instance;
  }

  /**
   * Initialize the graph database with the specified type
   * @param dbType - Type of graph database to use
   * @param uri - Connection URL
   * @param username - Database username
   * @param password - Database password
   */
  public async initialize(dbType: GraphDBType = 'arangodb', uri?: string, username?: string, password?: string): Promise<void> {
    this.activeDBType = dbType;

    try {
      if (dbType === 'neo4j') {
        this.neo4jService.initialize(uri, username, password);
        console.log('Neo4j initialized successfully');
      } else if (dbType === 'arangodb') {
        await this.arangoDBService.initialize(uri, undefined, username, password);
        console.log('ArangoDB initialized successfully');
      } else if (dbType === 'jena') {
        this.jenaService.initialize(uri, undefined, username, password);
        console.log('Jena Fuseki initialized successfully');
      }
    } catch (error) {
      console.error(`Failed to initialize ${dbType}:`, error);
      throw error;
    }
  }

  /**
   * Set the active graph database type
   */
  public setDBType(dbType: GraphDBType): void {
    this.activeDBType = dbType;
  }

  /**
   * Get the active graph database type
   */
  public getDBType(): GraphDBType {
    return this.activeDBType;
  }

  /**
   * Check if the active database is initialized
   */
  public isInitialized(): boolean {
    if (this.activeDBType === 'neo4j') {
      return this.neo4jService.isInitialized();
    } else if (this.activeDBType === 'jena') {
      return this.jenaService.isInitialized();
    } else {
      return this.arangoDBService.isInitialized();
    }
  }

  /**
   * Import triples into the active graph database
   */
  public async importTriples(triples: { subject: string; predicate: string; object: string }[]): Promise<void> {
    if (this.activeDBType === 'neo4j') {
      await this.neo4jService.importTriples(triples);
    } else if (this.activeDBType === 'jena') {
      await this.jenaService.importTriples(triples);
    } else {
      await this.arangoDBService.importTriples(triples);
    }
  }

  /**
   * Get graph data from the active graph database
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
    if (this.activeDBType === 'neo4j') {
      return await this.neo4jService.getGraphData();
    } else if (this.activeDBType === 'jena') {
      return await this.jenaService.getGraphData();
    } else {
      return await this.arangoDBService.getGraphData();
    }
  }

  /**
   * Log query information and metrics
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
    if (this.activeDBType === 'neo4j') {
      await this.neo4jService.logQuery(query, queryMode, metrics);
    } else if (this.activeDBType === 'jena') {
      await this.jenaService.logQuery(query, queryMode, metrics);
    } else {
      await this.arangoDBService.logQuery(query, queryMode, metrics);
    }
  }

  /**
   * Get query logs from the active graph database
   */
  public async getQueryLogs(limit: number = 100): Promise<any[]> {
    if (this.activeDBType === 'neo4j') {
      return await this.neo4jService.getQueryLogs(limit);
    } else if (this.activeDBType === 'jena') {
      return await this.jenaService.getQueryLogs(limit);
    } else {
      return await this.arangoDBService.getQueryLogs(limit);
    }
  }

  /**
   * Close the connection to the active graph database
   */
  public async close(): Promise<void> {
    if (this.activeDBType === 'neo4j') {
      this.neo4jService.close();
    } else if (this.activeDBType === 'jena') {
      this.jenaService.close();
    } else {
      this.arangoDBService.close();
    }
  }

  /**
   * Get info about the active graph database driver
   */
  public getDriverInfo(): Record<string, any> {
    if (this.activeDBType === 'neo4j') {
      return this.neo4jService.getDriverInfo();
    } else if (this.activeDBType === 'jena') {
      return this.jenaService.getDriverInfo();
    } else {
      return this.arangoDBService.getDriverInfo();
    }
  }

  /**
   * Clear all data from the active graph database
   */
  public async clearDatabase(): Promise<void> {
    if (this.activeDBType === 'neo4j') {
      // TODO: Implement Neo4j clear database functionality
      throw new Error('Clear database functionality not implemented for Neo4j');
    } else if (this.activeDBType === 'jena') {
      await this.jenaService.clearDatabase();
    } else {
      await this.arangoDBService.clearDatabase();
    }
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { getGraphDbService } from '@/lib/graph-db-util';
import { getGraphDbType } from '../settings/route';
import { GraphDBType } from '@/lib/graph-db-service';

/**
 * Initialize graph database connection with parameters from request
 * @param request Optional request containing connection parameters
 */
async function ensureConnection(request?: NextRequest): Promise<GraphDBType> {
  try {
    // Get the preferred database type from settings or request
    let graphDbType: GraphDBType;

    if (request?.nextUrl.searchParams.has('type')) {
      // Explicitly specified in the request
      graphDbType = request.nextUrl.searchParams.get('type') as GraphDBType;
    } else {
      // Get from settings, with a safe fallback
      graphDbType = getGraphDbType();
    }

    console.log(`Using graph database: ${graphDbType}`);

    // Get the appropriate service
    const graphDbService = getGraphDbService(graphDbType);

    if (graphDbType === 'neo4j') {
      // Neo4j connection params
      let uri = process.env.NEO4J_URI;
      let username = process.env.NEO4J_USER || process.env.NEO4J_USERNAME;
      let password = process.env.NEO4J_PASSWORD;

      // Override with URL parameters if provided
      if (request) {
        const params = request.nextUrl.searchParams;
        if (params.has('url')) uri = params.get('url') as string;
        if (params.has('username')) username = params.get('username') as string;
        if (params.has('password')) password = params.get('password') as string;
      }

      // Connect to Neo4j instance
      graphDbService.initialize(uri, username, password);
    } else if (graphDbType === 'arangodb') {
      // ArangoDB connection params - environment variables take absolute priority
      let url = process.env.ARANGODB_URL;
      let dbName = process.env.ARANGODB_DB;
      let username = process.env.ARANGODB_USER;
      let password = process.env.ARANGODB_PASSWORD;

      // Only use URL parameters if environment variables are not set
      if (request) {
        const params = request.nextUrl.searchParams;
        if (!url && params.has('url')) url = params.get('url') as string;
        if (!dbName && params.has('dbName')) dbName = params.get('dbName') as string;
        if (!username && params.has('username')) username = params.get('username') as string;
        if (!password && params.has('password')) password = params.get('password') as string;
      }

      // Connect to ArangoDB instance
      await (graphDbService as any).initialize(url, dbName, username, password);
    } else if (graphDbType === 'jena') {
      // Jena Fuseki connection params
      let endpoint = process.env.JENA_ENDPOINT;
      let dataset = process.env.JENA_DATASET;
      let username = process.env.JENA_USERNAME;
      let password = process.env.JENA_PASSWORD;

      // Override with URL parameters if provided
      if (request) {
        const params = request.nextUrl.searchParams;
        if (params.has('endpoint')) endpoint = params.get('endpoint') as string;
        if (params.has('dataset')) dataset = params.get('dataset') as string;
        if (params.has('username')) username = params.get('username') as string;
        if (params.has('password')) password = params.get('password') as string;
      }

      // Connect to Jena Fuseki instance
      (graphDbService as any).initialize(endpoint, dataset, username, password);
    }

    return graphDbType;
  } catch (error) {
    console.error(`Failed to initialize graph database connection:`, error);
    throw error;
  }
}

/**
 * GET handler for retrieving graph data from the selected graph database
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize with connection parameters
    const graphDbType = await ensureConnection(request);
    const graphDbService = getGraphDbService(graphDbType);

    // Get graph data from the database
    const graphData = await graphDbService.getGraphData();

    // Transform to format expected by the frontend
    const nodes = graphData.nodes.map(node => ({
      ...node,
      name: node.name || `Node ${node.id}`,
      label: node.labels?.[0] || 'Entity',
      val: 1, // Default size
      color: node.labels?.includes('Entity') ? '#ff6b6b' : '#4ecdc4'
    }));

    const links = graphData.relationships.map(rel => ({
      ...rel,
      label: rel.type || 'RELATED_TO'
    }));

    // Get the connection URL from request params or env
    const params = request.nextUrl.searchParams;
    const connectionUrl = params.get('url') || params.get('endpoint') ||
      (graphDbType === 'neo4j' ? process.env.NEO4J_URI :
        graphDbType === 'jena' ? process.env.JENA_ENDPOINT :
          process.env.ARANGODB_URL) ||
      'Not specified';

    // Convert to the format expected by the application
    return NextResponse.json({
      nodes,
      links,
      connectionUrl,
      databaseType: graphDbType
    });
  } catch (error) {
    console.error(`Error in graph database GET handler:`, error);
    return NextResponse.json(
      { error: `Failed to fetch graph data: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * POST handler for importing triples into the selected graph database
 */
export async function POST(request: NextRequest) {
  try {
    // Initialize with connection parameters
    const graphDbType = await ensureConnection(request);
    const graphDbService = getGraphDbService(graphDbType);

    // Parse request body
    const body = await request.json();

    // Validate request body
    if (!body.triples || !Array.isArray(body.triples)) {
      return NextResponse.json(
        { error: 'Invalid request: triples array is required' },
        { status: 400 }
      );
    }

    // Import triples into the graph database
    await graphDbService.importTriples(body.triples);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${body.triples.length} triples into ${graphDbType}`,
      databaseType: graphDbType
    });
  } catch (error) {
    console.error(`Error in graph database POST handler:`, error);
    return NextResponse.json(
      { error: `Failed to import triples: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 
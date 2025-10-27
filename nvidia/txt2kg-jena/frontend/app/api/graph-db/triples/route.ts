import { NextRequest, NextResponse } from 'next/server';
import { getGraphDbService } from '@/lib/graph-db-util';
import { getGraphDbType } from '../../settings/route';
import type { Triple } from '@/types/graph';
import { GraphDBType } from '@/lib/graph-db-service';

/**
 * API endpoint for fetching all triples from the selected graph database
 * GET /api/graph-db/triples
 */
export async function GET(req: NextRequest) {
  try {
    // Get the database type from settings or request parameter
    const graphDbType = req.nextUrl.searchParams.get('type') as GraphDBType || getGraphDbType();
    console.log(`Using graph database type: ${graphDbType}`);

    // Get the appropriate graph database service
    const graphDbService = getGraphDbService(graphDbType);

    // Initialize the service based on database type
    if (graphDbType === 'neo4j') {
      // Neo4j specific initialization
      const uri = process.env.NEO4J_URI;
      const username = process.env.NEO4J_USER || process.env.NEO4J_USERNAME;
      const password = process.env.NEO4J_PASSWORD;
      graphDbService.initialize(uri, username, password);
    } else if (graphDbType === 'arangodb') {
      // ArangoDB specific initialization
      const url = process.env.ARANGODB_URL;
      const dbName = process.env.ARANGODB_DB;
      const username = process.env.ARANGODB_USER;
      const password = process.env.ARANGODB_PASSWORD;
      await (graphDbService as any).initialize(url, dbName, username, password);
    } else if (graphDbType === 'jena') {
      // Jena Fuseki specific initialization
      const endpoint = process.env.JENA_ENDPOINT;
      const dataset = process.env.JENA_DATASET;
      const username = process.env.JENA_USERNAME;
      const password = process.env.JENA_PASSWORD;
      await (graphDbService as any).initialize(endpoint, dataset, username, password);
    }

    console.log(`Fetching all triples from ${graphDbType}...`);

    // Get all triples from the graph database
    // We'll use the graphDbService to get the graph data and then extract the triples
    const graphData = await graphDbService.getGraphData();

    // Extract triples from the graph data
    const triples: Triple[] = [];

    // Map of node IDs to names
    const nodeMap = new Map();
    for (const node of graphData.nodes) {
      nodeMap.set(node.id, node.name);
    }

    // Convert relationships to triples
    for (const rel of graphData.relationships) {
      const subject = nodeMap.get(rel.source);
      const object = nodeMap.get(rel.target);
      const predicate = rel.type;

      if (subject && predicate && object) {
        triples.push({
          subject,
          predicate,
          object
        });
      }
    }

    // Deduplicate triples
    const uniqueTriples = deduplicateTriples(triples);

    console.log(`Successfully fetched ${uniqueTriples.length} unique triples from ${graphDbType}`);

    // Return the triples
    return NextResponse.json({
      success: true,
      triples: uniqueTriples,
      count: uniqueTriples.length,
      databaseType: graphDbType
    });

  } catch (error) {
    console.error(`Error fetching triples from graph database:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch triples: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Helper function to deduplicate triples
 */
function deduplicateTriples(triples: Triple[]): Triple[] {
  const seen = new Set<string>();
  return triples.filter(triple => {
    // Create a string key for this triple
    const key = `${triple.subject.toLowerCase()}|${triple.predicate.toLowerCase()}|${triple.object.toLowerCase()}`;

    // Check if we've seen this triple before
    if (seen.has(key)) {
      return false;
    }

    // Mark this triple as seen
    seen.add(key);
    return true;
  });
}

/**
 * API endpoint for storing triples in the selected graph database
 * POST /api/graph-db/triples
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { triples, documentName } = body;

    if (!triples || !Array.isArray(triples)) {
      return NextResponse.json({ error: 'Triples are required' }, { status: 400 });
    }

    // Get the database type from settings or request parameter
    const graphDbType = req.nextUrl.searchParams.get('type') as GraphDBType || getGraphDbType();
    console.log(`Using graph database type: ${graphDbType}`);

    console.log(`Storing ${triples.length} triples in ${graphDbType} from document "${documentName || 'unnamed'}"`);

    // Get the appropriate graph database service
    const graphDbService = getGraphDbService(graphDbType);

    // Initialize the service based on database type
    if (graphDbType === 'neo4j') {
      // Neo4j specific initialization
      const uri = process.env.NEO4J_URI;
      const username = process.env.NEO4J_USER || process.env.NEO4J_USERNAME;
      const password = process.env.NEO4J_PASSWORD;
      graphDbService.initialize(uri, username, password);
    } else if (graphDbType === 'arangodb') {
      // ArangoDB specific initialization
      const url = process.env.ARANGODB_URL;
      const dbName = process.env.ARANGODB_DB;
      const username = process.env.ARANGODB_USER;
      const password = process.env.ARANGODB_PASSWORD;
      await (graphDbService as any).initialize(url, dbName, username, password);
    } else if (graphDbType === 'jena') {
      // Jena Fuseki specific initialization
      const endpoint = process.env.JENA_ENDPOINT;
      const dataset = process.env.JENA_DATASET;
      const username = process.env.JENA_USERNAME;
      const password = process.env.JENA_PASSWORD;
      await (graphDbService as any).initialize(endpoint, dataset, username, password);
    }

    // Filter triples to ensure they are valid
    const validTriples = triples.filter((triple: any) => {
      return (
        triple &&
        typeof triple.subject === 'string' && triple.subject.trim() !== '' &&
        typeof triple.predicate === 'string' && triple.predicate.trim() !== '' &&
        typeof triple.object === 'string' && triple.object.trim() !== ''
      );
    }) as Triple[];

    console.log(`Found ${validTriples.length} valid triples to store`);

    // Store triples in the graph database
    await graphDbService.importTriples(validTriples);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Triples stored successfully in ${graphDbType}`,
      count: validTriples.length,
      documentName,
      databaseType: graphDbType
    });

  } catch (error) {
    console.error('Error storing triples in graph database:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to store triples: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
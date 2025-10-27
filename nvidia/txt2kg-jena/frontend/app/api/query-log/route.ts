import { NextRequest, NextResponse } from 'next/server';
import queryLoggerService from '@/lib/query-logger';

/**
 * API endpoint to log query metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received query log request:', JSON.stringify(body));
    
    // Validate required fields
    if (!body.query) {
      return NextResponse.json(
        { error: 'Missing required field: query' },
        { status: 400 }
      );
    }
    
    if (!body.queryMode) {
      return NextResponse.json(
        { error: 'Missing required field: queryMode' },
        { status: 400 }
      );
    }
    
    if (!body.metrics || typeof body.metrics !== 'object') {
      return NextResponse.json(
        { error: 'Missing required field: metrics' },
        { status: 400 }
      );
    }
    
    // Initialize logger if not already
    if (!queryLoggerService.isInitialized()) {
      console.log('Initializing query logger service');
      await queryLoggerService.initialize();
    }
    
    // Log the query with metrics
    console.log(`Logging query "${body.query}" with mode "${body.queryMode}"`);
    await queryLoggerService.logQuery(
      body.query,
      body.queryMode,
      {
        executionTimeMs: body.metrics.executionTimeMs || 0,
        relevanceScore: body.metrics.relevanceScore,
        precision: body.metrics.precision,
        recall: body.metrics.recall,
        resultCount: body.metrics.resultCount || 0
      }
    );
    
    console.log('Query logged successfully to file');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging query:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to get query logs
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize logger if not already
    if (!queryLoggerService.isInitialized()) {
      console.log('Initializing query logger service for retrieving logs');
      await queryLoggerService.initialize();
    }
    
    // Get limit from query params or default to 25
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '25');
    console.log(`Retrieving up to ${limit} query logs`);
    
    // Get query logs
    const logs = await queryLoggerService.getQueryLogs(limit);
    console.log(`Retrieved ${logs.length} query logs from file`);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error getting query logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 
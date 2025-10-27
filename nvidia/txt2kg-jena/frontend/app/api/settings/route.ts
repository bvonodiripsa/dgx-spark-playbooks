import { NextRequest, NextResponse } from 'next/server';
import { GraphDBType } from '@/lib/graph-db-service';

// In-memory storage for settings
// Initialize with environment variables if available
let serverSettings: Record<string, string> = {
  ...(process.env.DEFAULT_GRAPH_DB_TYPE && { graph_db_type: process.env.DEFAULT_GRAPH_DB_TYPE })
};

/**
 * API Route to sync client settings with server environment variables
 * This allows us to use localStorage settings on the client side
 * and still access them as environment variables on the server side
 */
export async function POST(request: NextRequest) {
  try {
    const { settings } = await request.json();

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 });
    }

    // Update server settings
    serverSettings = { ...serverSettings, ...settings };

    // Log some important settings for debugging
    if (settings.graph_db_type) {
      console.log(`Setting graph database type to: ${settings.graph_db_type}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * GET /api/settings
 * Retrieve settings from the server side
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (key) {
      // Return specific setting
      const value = key === 'graph_db_type'
        ? getGraphDbType()  // Use the helper function that checks environment
        : (serverSettings[key] || null);
      return NextResponse.json({
        [key]: value
      });
    }

    // Return all settings (may want to filter sensitive ones in production)
    // Include the default graph DB type from environment
    return NextResponse.json({
      settings: {
        ...serverSettings,
        graph_db_type: getGraphDbType()
      }
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Helper function to get a setting value
 * For use in other API routes
 */
export function getSetting(key: string): string | null {
  return serverSettings[key] || null;
}

/**
 * Get the currently selected graph database type
 */
export function getGraphDbType(): GraphDBType {
  // Priority: client setting > environment variable > default (arangodb)
  return (serverSettings.graph_db_type as GraphDBType) ||
    (process.env.DEFAULT_GRAPH_DB_TYPE as GraphDBType) ||
    'arangodb';
} 
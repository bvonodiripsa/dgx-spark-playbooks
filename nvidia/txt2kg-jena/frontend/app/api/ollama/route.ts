import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/lib/llm-service';

/**
 * API endpoint for Ollama-specific operations
 * GET /api/ollama - Test connection and list available models
 * POST /api/ollama/extract-triples - Extract triples using Ollama model
 */

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'test-connection') {
      const result = await llmService.testOllamaConnection();
      return NextResponse.json(result);
    }

    // Default: test connection and return models
    const result = await llmService.testOllamaConnection();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in Ollama API:', error);
    return NextResponse.json(
      {
        error: 'Failed to connect to Ollama server',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, model = 'qwen3:1.7b', temperature = 0.1, maxTokens = 8192 } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Use the LLM service to generate completion with Ollama
    const messages = [
      {
        role: 'system' as const,
        content: `You are a knowledge graph builder that extracts structured information from text.
Extract subject-predicate-object triples from the following text.

Guidelines:
- Extract only factual triples present in the text
- Normalize entity names to their canonical form
- Return ONLY a JSON array with objects containing "subject", "predicate", "object" fields
- Each triple should represent a clear relationship between two entities
- Focus on the most important relationships in the text
- Do not include any explanatory text, just the JSON array
- Example format: [{"subject": "John", "predicate": "works_at", "object": "Microsoft"}]`
      },
      {
        role: 'user' as const,
        content: `Extract triples from this text:\n\n${text}`
      }
    ];

    const response = await llmService.generateOllamaCompletion(
      model,
      messages,
      { temperature, maxTokens }
    );

    // Parse the response to extract triples
    let triples = [];
    try {
      console.log('Raw Ollama response:', response);

      // Try multiple JSON extraction methods
      let jsonString = null;

      // Method 1: Look for JSON array in response
      const jsonArrayMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonArrayMatch) {
        jsonString = jsonArrayMatch[0];
      }

      // Method 2: Try to parse the entire response as JSON
      if (!jsonString) {
        try {
          JSON.parse(response);
          jsonString = response;
        } catch (e) {
          // Not valid JSON, continue to other methods
        }
      }

      // Method 3: Look for JSON objects within the text
      if (!jsonString) {
        const jsonObjectsRegex = /\{[\s\S]*?"subject"[\s\S]*?"predicate"[\s\S]*?"object"[\s\S]*?\}/g;
        const matches = response.match(jsonObjectsRegex);
        if (matches && matches.length > 0) {
          jsonString = '[' + matches.join(',') + ']';
        }
      }

      if (jsonString) {
        triples = JSON.parse(jsonString);
        console.log('Successfully parsed JSON triples:', triples);
      } else {
        console.log('No JSON found, using fallback parser');
        triples = parseTriplesFallback(response);
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback parser:', parseError);
      console.log('Response that failed to parse:', response);
      triples = parseTriplesFallback(response);
    }

    return NextResponse.json({
      triples: triples.map((triple, index) => ({
        ...triple,
        confidence: 0.8, // Default confidence for Ollama extractions
        metadata: {
          entityTypes: [],
          source: text.substring(0, 100) + '...',
          context: text.substring(0, 200) + '...',
          extractionMethod: 'ollama',
          model: model
        }
      })),
      count: triples.length,
      success: true,
      method: 'ollama',
      model: model
    });
  } catch (error) {
    console.error('Error in Ollama triple extraction:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract triples with Ollama',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

// Fallback parser for when JSON parsing fails
function parseTriplesFallback(text: string): Array<{ subject: string, predicate: string, object: string }> {
  const triples = [];
  const lines = text.split('\n');

  for (const line of lines) {
    // Look for patterns like "Subject - Predicate - Object" or similar
    const tripleMatch = line.match(/^[\s\-\*\d\.]*(.+?)\s*[\-\|]\s*(.+?)\s*[\-\|]\s*(.+)$/);
    if (tripleMatch) {
      triples.push({
        subject: tripleMatch[1].trim(),
        predicate: tripleMatch[2].trim(),
        object: tripleMatch[3].trim()
      });
    }

    // Also look for JSON-like objects in the text
    const jsonObjectMatch = line.match(/\{\s*"subject"\s*:\s*"([^"]+)"\s*,\s*"predicate"\s*:\s*"([^"]+)"\s*,\s*"object"\s*:\s*"([^"]+)"\s*\}/);
    if (jsonObjectMatch) {
      triples.push({
        subject: jsonObjectMatch[1],
        predicate: jsonObjectMatch[2],
        object: jsonObjectMatch[3]
      });
    }
  }

  return triples;
}

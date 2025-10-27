/**
 * Text processing utilities for knowledge graph extraction
 * Matches PyTorch Geometric's txt2kg.py implementation
 */

import type { Triple } from '@/types/graph'

const CHUNK_SIZE = 20000 // Optimized for Gemma3:27b on DGX Spark
const OVERLAP_SIZE = 1000 // For context preservation between chunks

/**
 * Chunks text using PyTorch Geometric's exact chunking algorithm
 * Replicates the chunk_text function from PyG's txt2kg.py
 */
export function chunkTextPyG(text: string, chunkSize: number = 512, overlapSize: number = 0): string[] {
  if (!text) {
    return [];
  }

  const chunks: string[] = [];
  const sentenceEndings = '.!?';
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Calculate the end index for this chunk
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    
    // If this is the last chunk (remaining text fits in chunk size), add it and break
    if (endIndex >= text.length) {
      const finalChunk = text.slice(startIndex).trim();
      if (finalChunk) {
        chunks.push(finalChunk);
      }
      break;
    }

    // Start with the maximum possible chunk from current position
    let chunk = text.slice(startIndex, endIndex);
    let bestSplit = endIndex;

    // Try to find the last sentence ending within the chunk
    for (const ending of sentenceEndings) {
      const lastEnding = chunk.lastIndexOf(ending);
      if (lastEnding !== -1) {
        // Calculate absolute position in the original text
        const absolutePos = startIndex + lastEnding + 1;
        // Check if there's a space after the punctuation
        const hasSpace = absolutePos < text.length && text[absolutePos] === ' ';
        bestSplit = Math.min(bestSplit, absolutePos + (hasSpace ? 1 : 0));
      }
    }

    // Adjust to ensure we don't break words
    // If the next character is a letter, find the last space
    if (bestSplit < text.length && /[a-zA-Z]/.test(text[bestSplit])) {
      const chunkToSplit = text.slice(startIndex, bestSplit);
      const spaceSplit = chunkToSplit.lastIndexOf(' ');
      if (spaceSplit !== -1) {
        bestSplit = startIndex + spaceSplit;
      }
    }

    // Extract and add the chunk
    const currentChunk = text.slice(startIndex, bestSplit).trim();
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Calculate next start position
    if (overlapSize === 0) {
      // Original PyG behavior: no overlap
      startIndex = bestSplit;
      // Skip whitespace at the beginning of next chunk
      while (startIndex < text.length && /\s/.test(text[startIndex])) {
        startIndex++;
      }
    } else {
      // With overlap: move forward by (chunkSize - overlapSize)
      const step = Math.max(1, chunkSize - overlapSize);
      startIndex += step;
    }
  }

  return chunks;
}

/**
 * Chunks text into sentence-based segments, matching Python implementation
 */
export function chunkText(text: string, chunkSize: number = CHUNK_SIZE): string[] {
  // If the input text is empty or None, return an empty list
  if (!text) {
    return []
  }

  // List of punctuation marks that typically end sentences
  const sentenceEndings = '.!?'

  // List to store the resulting chunks
  const chunks: string[] = []

  // Continue processing the entire text
  let remainingText = text
  while (remainingText) {
    // If the remaining text is shorter than chunk_size, add it and break
    if (remainingText.length <= chunkSize) {
      chunks.push(remainingText.trim())
      break
    }

    // Start with the maximum possible chunk
    let chunk = remainingText.slice(0, chunkSize)

    // Try to find the last sentence ending within the chunk
    let bestSplit = chunkSize
    for (const ending of sentenceEndings) {
      // Find the last occurrence of the ending punctuation
      const lastEnding = chunk.lastIndexOf(ending)
      if (lastEnding !== -1) {
        // Ensure we include the punctuation and any following space
        bestSplit = Math.min(
          bestSplit,
          lastEnding + 1 + (lastEnding + 1 < chunk.length && /\s/.test(chunk[lastEnding + 1]) ? 1 : 0)
        )
      }
    }

    // Adjust to ensure we don't break words
    // If the next character is a letter, find the last space
    if (bestSplit < remainingText.length && /[a-zA-Z]/.test(remainingText[bestSplit])) {
      const spaceSplit = remainingText.slice(0, bestSplit).lastIndexOf(' ')
      if (spaceSplit !== -1) {
        bestSplit = spaceSplit
      }
    }

    // Append the chunk, ensuring it's stripped
    chunks.push(remainingText.slice(0, bestSplit).trim())

    // Remove the processed part from the text
    remainingText = remainingText.slice(bestSplit).trim()
  }

  return chunks
}

/**
 * Merges triples from multiple chunks, removing duplicates
 */
export function mergeTriples(triplesArrays: Array<Array<Triple>>): Array<Triple> {
  const uniqueTriplesMap = new Map<string, Triple>()

  for (const triples of triplesArrays) {
    for (const triple of triples) {
      const key = `${triple.subject}|${triple.predicate}|${triple.object}`
      if (!uniqueTriplesMap.has(key)) {
        uniqueTriplesMap.set(key, triple)
      }
    }
  }

  return Array.from(uniqueTriplesMap.values())
}

/**
 * Parses triple strings into structured Triple objects, matching Python patterns
 */
export function parseTriples(triplesStr: string): Triple[] {
  const processed: Triple[] = []
  const splitByNewline = triplesStr.split('\n')

  // First try newline-separated format
  if (splitByNewline.length > 1) {
    for (const line of splitByNewline) {
      const triple = parseTripleLine(line.trim())
      if (triple) processed.push(triple)
    }
  } else {
    // Handle space-separated format "(e, r, e) (e, r, e) ... (e, r, e)"
    const splitTriples = triplesStr.slice(1, -1).split(') (')
    for (const tripleStr of splitTriples) {
      const triple = parseTripleLine(tripleStr)
      if (triple) processed.push(triple)
    }
  }

  return processed
}

/**
 * Helper function to parse a single triple line with multiple formats
 */
function parseTripleLine(line: string): Triple | null {
  if (!line.trim() || line.toLowerCase().includes('note:')) return null

  // Try different regex patterns matching Python implementation
  const patterns = [
    // Standard format: ('subject', 'relation', 'object')
    /\('([^']+)',\s*'([^']+)',\s*'([^']+)'\)/,
    // Double quotes: ("subject", "relation", "object")
    /\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\)/,
    // No parentheses: "subject", "relation", "object"
    /"([^"]+)",\s*"([^"]+)",\s*"([^"]+)"/,
    // Mixed quotes: ('subject', "relation", 'object')
    /\(['"]([^'"]+)['"],\s*['"]([^'"]+)['"],\s*['"]([^'"]+)['"]\)/,
    // Plain text: subject, relation, object
    /^([^,]+),\s*([^,]+),\s*(.+)$/
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (match) {
      return {
        subject: match[1].trim().toLowerCase(),
        predicate: match[2].trim().toLowerCase(),
        object: match[3].trim().toLowerCase()
      }
    }
  }

  return null
}

// Re-export types
export type { Triple }

/**
 * Converts triples to a graph representation
 * @param triples Array of triples
 * @returns Graph representation with nodes and edges
 */
export function triplesToGraph(triples: Triple[]) {
  const nodes = new Map<string, { id: string; label: string }>()
  const edges: Array<{ source: string; target: string; label: string }> = []

  // Process each triple to build nodes and edges
  for (const triple of triples) {
    // Add subject node if not exists
    if (!nodes.has(triple.subject)) {
      nodes.set(triple.subject, {
        id: triple.subject,
        label: triple.subject,
      })
    }

    // Add object node if not exists
    if (!nodes.has(triple.object)) {
      nodes.set(triple.object, {
        id: triple.object,
        label: triple.object,
      })
    }

    // Add edge
    edges.push({
      source: triple.subject,
      target: triple.object,
      label: triple.predicate,
    })
  }

  return {
    nodes: Array.from(nodes.values()),
    edges,
  }
}

/**
 * Processes text using PyTorch Geometric's exact chunking method (no overlap)
 * Replicates the chunking behavior from PyG's txt2kg.py
 * @param text Text to process
 * @param extractTriplesFn Function to extract triples from a chunk
 * @param chunkSize Maximum size of each chunk (default: 512 like PyG)
 * @returns Array of extracted triples
 */
export async function processTextWithChunkingPyG(
  text: string,
  extractTriplesFn: (chunk: string) => Promise<Triple[]>,
  chunkSize = 512,
  overlapSize = 0,
): Promise<Triple[]> {
  // If text is small enough, process directly
  if (text.length <= chunkSize) {
    return await extractTriplesFn(text)
  }

  // Chunk the text using PyG method with configurable overlap
  const chunks = chunkTextPyG(text, chunkSize, overlapSize)
  const overlapText = overlapSize > 0 ? `, ${overlapSize} char overlap` : ', no overlap'
  console.log(`PyG Chunking: Split text into ${chunks.length} chunks (${chunkSize} chars each${overlapText})`)

  // Process each chunk
  const triplesPromises = chunks.map((chunk, i) => {
    console.log(`Processing PyG chunk ${i + 1}/${chunks.length}, size: ${chunk.length}`)
    return extractTriplesFn(chunk)
  })

  // Wait for all chunks to be processed
  const triplesArrays = await Promise.all(triplesPromises)

  // Merge results (no deduplication needed since PyG doesn't use overlap)
  return mergeTriples(triplesArrays)
}

/**
 * Processes text to extract triples using chunking for large texts
 * @param text Text to process
 * @param extractTriplesFn Function to extract triples from a chunk
 * @param chunkSize Maximum size of each chunk
 * @param overlapSize Size of overlap between chunks
 * @returns Array of extracted triples
 */
export async function processTextWithChunking(
  text: string,
  extractTriplesFn: (chunk: string) => Promise<Triple[]>,
  chunkSize = 20000,
  overlapSize = 1000,
): Promise<Triple[]> {
  // If text is small enough, process directly
  if (text.length <= chunkSize) {
    return await extractTriplesFn(text)
  }

  // Chunk the text
  const chunks = chunkText(text, chunkSize)
  console.log(`Split text into ${chunks.length} chunks`)

  // Process each chunk
  const triplesPromises = chunks.map((chunk, i) => {
    console.log(`Processing chunk ${i + 1}/${chunks.length}, size: ${chunk.length}`)
    return extractTriplesFn(chunk)
  })

  // Wait for all chunks to be processed
  const triplesArrays = await Promise.all(triplesPromises)

  // Merge results
  return mergeTriples(triplesArrays)
}


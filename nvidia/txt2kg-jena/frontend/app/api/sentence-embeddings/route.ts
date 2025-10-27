import { NextRequest, NextResponse } from 'next/server';
import { processSentenceEmbeddings, SentenceEmbedding } from '@/lib/text-processor';
import { PineconeService } from '@/lib/pinecone';

/**
 * API endpoint for splitting text into sentences and generating embeddings
 * POST /api/sentence-embeddings
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const { text, documentId } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    console.log(`Processing sentence embeddings for document ${documentId || 'unnamed'}`);
    console.log(`Text length: ${text.length} characters`);

    // Process sentences and generate embeddings
    let sentenceEmbeddings: SentenceEmbedding[] = [];
    try {
      sentenceEmbeddings = await processSentenceEmbeddings(text, documentId);
      console.log(`Generated embeddings for ${sentenceEmbeddings.length} sentences using local sentence-transformers service`);
    } catch (embeddingError) {
      console.error('Error generating embeddings:', embeddingError);
      return NextResponse.json(
        { error: `Failed to generate embeddings: ${embeddingError instanceof Error ? embeddingError.message : String(embeddingError)}` },
        { status: 500 }
      );
    }

    // Optionally store in vector database
    if (sentenceEmbeddings.length > 0) {
      try {
        // Map the embeddings to a format suitable for Pinecone
        const embeddingsMap = new Map<string, number[]>();
        const textContentMap = new Map<string, string>();
        const metadataMap = new Map<string, any>();
        
        // Create unique keys for each sentence
        sentenceEmbeddings.forEach((item, index) => {
          const key = `${documentId || 'doc'}_sentence_${index}`;
          embeddingsMap.set(key, item.embedding);
          textContentMap.set(key, item.sentence);
          metadataMap.set(key, item.metadata);
        });
        
        // Store in Pinecone
        const pineconeService = PineconeService.getInstance();
        await pineconeService.storeEmbeddingsWithMetadata(
          embeddingsMap,
          textContentMap, 
          metadataMap
        );
        
        console.log(`Stored ${sentenceEmbeddings.length} sentence embeddings in vector database`);
      } catch (storageError) {
        console.error('Error storing sentence embeddings:', storageError);
        // Continue even if storage fails - we'll still return the embeddings
      }
    }

    // Return a summary to avoid large response sizes
    return NextResponse.json({
      success: true,
      count: sentenceEmbeddings.length,
      documentId: documentId || 'unnamed',
      // Return only the first few embeddings as samples
      samples: sentenceEmbeddings.slice(0, 3).map(item => ({
        sentence: item.sentence,
        metadata: item.metadata,
        embeddingDimensions: item.embedding.length
      }))
    });
  } catch (error) {
    console.error('Error processing sentence embeddings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to process sentence embeddings: ${errorMessage}` },
      { status: 500 }
    );
  }
} 
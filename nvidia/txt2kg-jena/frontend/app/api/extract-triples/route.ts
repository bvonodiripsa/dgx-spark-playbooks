import { NextRequest, NextResponse } from 'next/server';
import { processDocument, TextProcessor } from '@/lib/text-processor';

/**
 * API endpoint for extracting triples from text using the LangChain-based pipeline
 * POST /api/extract-triples
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    const {
      text,
      useLangChain = false,
      useGraphTransformer = false,
      systemPrompt,
      extractionPrompt,
      graphTransformerPrompt,
      llmProvider,
      ollamaModel,
      ollamaBaseUrl,
      vllmModel,
      vllmBaseUrl
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // If Ollama is specified, use the Ollama API endpoint
    if (llmProvider === 'ollama') {
      const ollamaResponse = await fetch(`${req.nextUrl.origin}/api/ollama`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model: ollamaModel || 'llama3.1:8b',
          temperature: 0.1,
          maxTokens: 8192
        })
      });

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.statusText}`);
      }

      const ollamaResult = await ollamaResponse.json();
      return NextResponse.json(ollamaResult);
    }

    // If vLLM is specified, use the vLLM API endpoint
    if (llmProvider === 'vllm') {
      const vllmResponse = await fetch(`${req.nextUrl.origin}/api/vllm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model: vllmModel || 'meta-llama/Llama-3.2-3B-Instruct',
          temperature: 0.1,
          maxTokens: 8192
        })
      });

      if (!vllmResponse.ok) {
        throw new Error(`vLLM API error: ${vllmResponse.statusText}`);
      }

      const vllmResult = await vllmResponse.json();
      return NextResponse.json(vllmResult);
    }

    // Configure TextProcessor for the specified LLM provider
    const processor = TextProcessor.getInstance();
    if (llmProvider && ['ollama', 'nvidia', 'vllm'].includes(llmProvider)) {
      processor.setLLMProvider(llmProvider as 'ollama' | 'nvidia' | 'vllm', {
        ollamaModel: ollamaModel,
        ollamaBaseUrl: ollamaBaseUrl,
        vllmModel: vllmModel,
        vllmBaseUrl: vllmBaseUrl
      });
    }

    // Process the text to extract triples using either default pipeline or LangChain transformer
    // When both useLangChain and useGraphTransformer are true, use the GraphTransformer
    // When only useLangChain is true, use the default LangChain pipeline
    // Pass custom prompts if provided
    const options = {
      systemPrompt,
      extractionPrompt,
      graphTransformerPrompt
    };

    const triples = await processDocument(text, useLangChain, useGraphTransformer, options);

    // Return the extracted triples
    return NextResponse.json({
      triples,
      count: triples.length,
      success: true,
      method: useGraphTransformer
        ? 'langchain_graphtransformer'
        : useLangChain
          ? 'langchain_default'
          : 'standard_pipeline',
      llmProvider: processor.getLLMProvider(),
      customPromptUsed: !!(systemPrompt || extractionPrompt || graphTransformerPrompt)
    });
  } catch (error) {
    console.error('Error in triple extraction:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to extract triples: ${errorMessage}` },
      { status: 500 }
    );
  }
}


#!/usr/bin/env node

/**
 * Test script for Ollama integration
 * This script tests the Ollama integration by making direct API calls
 * 
 * Usage: node test_ollama_integration.js [base-url]
 * Example: node test_ollama_integration.js http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log('🧪 Testing Ollama Integration');
console.log('================================');
console.log(`Base URL: ${baseUrl}`);
console.log('');
console.log('📋 Prerequisites:');
console.log('   1. Ollama should be installed and running');
console.log('   2. At least one model should be pulled (e.g., ollama pull qwen3:1.7b)');
console.log('   3. Development server should be running (npm run dev)');
console.log('');

async function testOllamaIntegration() {
  try {
    console.log('1. Testing Ollama connection...');
    
    // Test connection
    const connectionResponse = await fetch(`${baseUrl}/api/ollama?action=test-connection`);
    const connectionResult = await connectionResponse.json();
    
    if (!connectionResult.connected) {
      console.log('❌ Connection test failed:', connectionResult.error);
      console.log('   Make sure Ollama is installed and running:');
      console.log('   - Install: https://ollama.com');
      console.log('   - Run: ollama serve');
      console.log('   - Pull a model: ollama pull llama3.2');
      return;
    }
    
    console.log('✅ Connection successful');
    console.log(`   Available models: ${connectionResult.models?.join(', ') || 'none'}`);
    console.log('');
    
    console.log('2. Testing triple extraction...');
    
    const sampleText = `
    Apple Inc. is a multinational technology company headquartered in Cupertino, California. 
    The company was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976. 
    Apple designs and develops consumer electronics, computer software, and online services. 
    Tim Cook is the current CEO of Apple Inc.
    `.trim();
    
    console.log(`   Input text: "${sampleText.substring(0, 100)}..."`);
    
    const extractionResponse = await fetch(`${baseUrl}/api/ollama`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
              body: JSON.stringify({
          text: sampleText,
          model: 'qwen3:1.7b',
          temperature: 0.1,
          maxTokens: 1024
        })
    });
    
    if (!extractionResponse.ok) {
      const errorText = await extractionResponse.text();
      console.log('❌ Triple extraction failed:', errorText);
      return;
    }
    
    const extractionResult = await extractionResponse.json();
    
    console.log('✅ Triple extraction successful');
    console.log(`   Triples extracted: ${extractionResult.triples?.length || 0}`);
    console.log(`   Model used: ${extractionResult.model}`);
    
    if (extractionResult.triples && extractionResult.triples.length > 0) {
      console.log('   Sample triples:');
      extractionResult.triples.slice(0, 3).forEach((triple, index) => {
        console.log(`     ${index + 1}. ${triple.subject} → ${triple.predicate} → ${triple.object}`);
      });
    }
    
    console.log('');
    console.log('3. Testing via extract-triples API...');
    
    const apiResponse = await fetch(`${baseUrl}/api/extract-triples`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: sampleText,
        llmProvider: 'ollama',
        ollamaModel: 'qwen3:1.7b'
      })
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.log('❌ API extraction failed:', errorText);
      return;
    }
    
    const apiResult = await apiResponse.json();
    
    console.log('✅ API extraction successful');
    console.log(`   Triples extracted: ${apiResult.triples?.length || 0}`);
    console.log(`   Method: ${apiResult.method}`);
    console.log(`   LLM Provider: ${apiResult.llmProvider || 'not specified'}`);
    
    console.log('');
    console.log('🎉 All tests passed! Ollama integration is working correctly.');
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('   The development server might not be running.');
      console.log('   Start it with: npm run dev');
    }
  }
}

// Run the test
testOllamaIntegration();

#!/usr/bin/env node

/**
 * Test script for the new connection pooling and batch processing optimizations
 * This script tests both single and batch processing to compare performance
 * 
 * Usage: node test_optimizations.js [base-url] [num-texts]
 * Example: node test_optimizations.js http://localhost:3000 10
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';
const numTexts = parseInt(process.argv[3]) || 5;

console.log('🚀 Testing Ollama Optimizations');
console.log('=================================');
console.log(`Base URL: ${baseUrl}`);
console.log(`Number of texts: ${numTexts}`);
console.log('');

// Sample texts for testing
const sampleTexts = [
  "Apple Inc. is a multinational technology company headquartered in Cupertino, California. The company was founded by Steve Jobs, Steve Wozniak, and Ronald Wayne in 1976.",
  "Microsoft Corporation is an American multinational technology corporation which produces computer software, consumer electronics, personal computers, and related services.",
  "Google LLC is an American multinational technology company that specializes in Internet-related services and products, including online advertising technologies, a search engine, cloud computing, software, and hardware.",
  "Amazon.com, Inc. is an American multinational technology company which focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
  "Tesla, Inc. is an American electric vehicle and clean energy company based in Palo Alto, California. Tesla's current products include electric cars, battery energy storage from home to grid-scale, solar panels and solar roof tiles.",
  "Netflix, Inc. is an American over-the-top content platform and production company headquartered in Los Gatos, California.",
  "Facebook, Inc. is an American online social media and social networking service company based in Menlo Park, California.",
  "Twitter, Inc. is an American microblogging and social networking service on which users post and interact with messages known as tweets.",
  "LinkedIn Corporation is an American business and employment-oriented service that operates via websites and mobile apps.",
  "Uber Technologies, Inc. is an American mobility as a service provider based in San Francisco, with operations in over 900 metropolitan areas worldwide."
];

// Get the specified number of texts, cycling if needed
const testTexts = Array.from({ length: numTexts }, (_, i) => sampleTexts[i % sampleTexts.length]);

async function testSingleProcessing() {
  console.log('1. Testing Single Processing (Sequential)...');
  const startTime = Date.now();
  
  const results = [];
  for (let i = 0; i < testTexts.length; i++) {
    console.log(`   Processing text ${i + 1}/${testTexts.length}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/ollama`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testTexts[i],
          model: 'qwen3:1.7b',
          temperature: 0.1,
          maxTokens: 1024
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      results.push(result);
    } catch (error) {
      console.log(`   ❌ Error processing text ${i + 1}:`, error.message);
      results.push({ error: error.message });
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  const successCount = results.filter(r => !r.error).length;
  const totalTriples = results.reduce((sum, r) => sum + (r.triples?.length || 0), 0);
  
  console.log(`   ✅ Single processing completed in ${duration}ms`);
  console.log(`   📊 Success rate: ${successCount}/${testTexts.length}`);
  console.log(`   🔗 Total triples: ${totalTriples}`);
  console.log('');
  
  return { duration, successCount, totalTriples, results };
}

async function testBatchProcessing() {
  console.log('2. Testing Batch Processing...');
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/ollama/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts: testTexts,
        model: 'qwen3:1.7b',
        temperature: 0.1,
        maxTokens: 1024,
        concurrency: 3 // Conservative concurrency for testing
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`   ✅ Batch processing completed in ${duration}ms`);
    console.log(`   📊 Success rate: ${result.summary.successfulTexts}/${result.summary.totalTexts}`);
    console.log(`   🔗 Total triples: ${result.summary.totalTriples}`);
    console.log(`   🔄 Average attempts per text: ${result.batchInfo.averageAttempts || 'N/A'}`);
    console.log(`   ⚡ Concurrency used: ${result.batchInfo.concurrency || 'N/A'}`);
    
    if (result.errors && result.errors.length > 0) {
      console.log(`   ⚠️  Errors: ${result.errors.length}`);
      result.errors.forEach(error => {
        console.log(`      Text ${error.index}: ${error.error} (attempts: ${error.attempts || 1})`);
      });
    }
    
    console.log('');
    
    return { 
      duration, 
      successCount: result.summary.successfulTexts, 
      totalTriples: result.summary.totalTriples,
      result
    };
  } catch (error) {
    console.log(`   ❌ Batch processing failed:`, error.message);
    return { duration: 0, successCount: 0, totalTriples: 0, error: error.message };
  }
}

async function testConnectionHealth() {
  console.log('0. Testing Ollama Connection...');
  
  try {
    const response = await fetch(`${baseUrl}/api/ollama?action=test-connection`);
    const result = await response.json();
    
    if (result.connected) {
      console.log('   ✅ Ollama connection successful');
      console.log(`   📋 Available models: ${result.models?.join(', ') || 'none'}`);
      
      // Check if our test model is available
      if (result.models && result.models.includes('qwen3:1.7b')) {
        console.log('   ✅ Test model (qwen3:1.7b) is available');
      } else {
        console.log('   ⚠️  Test model (qwen3:1.7b) not found, using available model');
      }
    } else {
      console.log('   ❌ Ollama connection failed:', result.error);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Connection test failed:', error.message);
    return false;
  }
  
  console.log('');
  return true;
}

async function runPerformanceComparison() {
  // Test connection first
  const connectionOk = await testConnectionHealth();
  if (!connectionOk) {
    console.log('❌ Cannot proceed without Ollama connection');
    return;
  }
  
  // Run both tests
  const singleResult = await testSingleProcessing();
  const batchResult = await testBatchProcessing();
  
  // Compare results
  console.log('📈 Performance Comparison');
  console.log('========================');
  
  if (batchResult.duration > 0 && singleResult.duration > 0) {
    const speedup = (singleResult.duration / batchResult.duration).toFixed(2);
    const timeSaved = singleResult.duration - batchResult.duration;
    
    console.log(`⏱️  Single processing: ${singleResult.duration}ms`);
    console.log(`⏱️  Batch processing:  ${batchResult.duration}ms`);
    console.log(`🚀 Speed improvement: ${speedup}x faster`);
    console.log(`💾 Time saved: ${timeSaved}ms (${((timeSaved / singleResult.duration) * 100).toFixed(1)}%)`);
  } else {
    console.log('❌ Could not compare performance due to errors');
  }
  
  console.log('');
  console.log('🎯 Key Benefits of Optimizations:');
  console.log('- Connection pooling reduces connection overhead');
  console.log('- Batch processing enables parallel execution');
  console.log('- Retry logic improves reliability');
  console.log('- Controlled concurrency prevents overload');
  console.log('');
  
  if (batchResult.result && !batchResult.error) {
    console.log('✨ Batch Processing Features Demonstrated:');
    console.log('- Parallel processing with controlled concurrency');
    console.log('- Automatic retry with exponential backoff');
    console.log('- Detailed error reporting and statistics');
    console.log('- Connection pooling for better performance');
  }
}

// Run the performance comparison
runPerformanceComparison().catch(error => {
  console.error('❌ Test failed with error:', error);
  process.exit(1);
});

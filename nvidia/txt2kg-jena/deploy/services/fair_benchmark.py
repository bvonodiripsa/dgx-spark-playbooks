#!/usr/bin/env python3
"""
Fair LLM Benchmark Script: vLLM vs Ollama Performance Comparison
Runs services one at a time to ensure fair resource allocation
"""

import asyncio
import aiohttp
import time
import json
import statistics
import argparse
import subprocess
import sys
import os
from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class BenchmarkResult:
    service: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    response_time: float
    tokens_per_second: float
    first_token_time: float = 0.0
    error: str = ""

class FairLLMBenchmark:
    def __init__(self):
        self.vllm_url = "http://localhost:8001"
        self.ollama_url = "http://localhost:11434"
        self.vllm_dir = "/home/nvidia/txt2kg/txt2kg/deploy/services/vllm"
        self.ollama_dir = "/home/nvidia/txt2kg/txt2kg/deploy/services/ollama"
        
    def run_command(self, cmd: str, cwd: str = None) -> tuple[int, str]:
        """Run a shell command and return exit code and output"""
        try:
            result = subprocess.run(
                cmd, 
                shell=True, 
                cwd=cwd, 
                capture_output=True, 
                text=True,
                timeout=120
            )
            return result.returncode, result.stdout + result.stderr
        except subprocess.TimeoutExpired:
            return -1, "Command timed out"
        except Exception as e:
            return -1, str(e)
    
    def stop_all_services(self):
        """Stop both vLLM and Ollama services"""
        print("🛑 Stopping all services...")
        
        # Stop vLLM
        exit_code, output = self.run_command("docker compose down", self.vllm_dir)
        if exit_code != 0:
            print(f"Warning: Failed to stop vLLM: {output}")
        
        # Stop Ollama
        exit_code, output = self.run_command("docker compose down", self.ollama_dir)
        if exit_code != 0:
            print(f"Warning: Failed to stop Ollama: {output}")
        
        # Wait for services to fully stop
        time.sleep(10)
        print("✅ All services stopped")
    
    def start_vllm(self) -> bool:
        """Start vLLM service and wait for it to be ready"""
        print("🚀 Starting vLLM service...")
        
        # Start the service
        exit_code, output = self.run_command("bash -c 'source .env && docker compose up -d'", self.vllm_dir)
        if exit_code != 0:
            print(f"❌ Failed to start vLLM: {output}")
            return False
        
        # Wait for service to be ready
        print("⏳ Waiting for vLLM to be ready...")
        for i in range(60):  # Wait up to 5 minutes
            try:
                response = subprocess.run(
                    ["curl", "-s", f"{self.vllm_url}/health"],
                    capture_output=True,
                    timeout=5
                )
                if response.returncode == 0:
                    print("✅ vLLM is ready!")
                    return True
            except:
                pass
            
            time.sleep(5)
            if i % 6 == 0:  # Print progress every 30 seconds
                print(f"   Still waiting... ({i*5}s)")
        
        print("❌ vLLM failed to start within timeout")
        return False
    
    def start_ollama(self) -> bool:
        """Start Ollama service and wait for it to be ready"""
        print("🚀 Starting Ollama service...")
        
        # Start the service
        exit_code, output = self.run_command("docker compose up -d", self.ollama_dir)
        if exit_code != 0:
            print(f"❌ Failed to start Ollama: {output}")
            return False
        
        # Wait for service to be ready
        print("⏳ Waiting for Ollama to be ready...")
        for i in range(24):  # Wait up to 2 minutes
            try:
                response = subprocess.run(
                    ["curl", "-s", f"{self.ollama_url}/api/tags"],
                    capture_output=True,
                    timeout=5
                )
                if response.returncode == 0:
                    print("✅ Ollama is ready!")
                    return True
            except:
                pass
            
            time.sleep(5)
            if i % 6 == 0:  # Print progress every 30 seconds
                print(f"   Still waiting... ({i*5}s)")
        
        print("❌ Ollama failed to start within timeout")
        return False
    
    async def test_vllm(self, session: aiohttp.ClientSession, prompt: str, max_tokens: int = 100) -> BenchmarkResult:
        """Test vLLM performance"""
        start_time = time.time()
        
        payload = {
            "model": "meta-llama/Llama-3.1-8B-Instruct",
            "prompt": prompt,
            "max_tokens": max_tokens,
            "temperature": 0.7,
            "stream": False
        }
        
        try:
            async with session.post(f"{self.vllm_url}/v1/completions", json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    return BenchmarkResult(
                        service="vLLM",
                        model="Llama-3.1-8B-Instruct",
                        prompt_tokens=0,
                        completion_tokens=0,
                        total_tokens=0,
                        response_time=0,
                        tokens_per_second=0,
                        error=f"HTTP {response.status}: {error_text}"
                    )
                
                result = await response.json()
                end_time = time.time()
                
                response_time = end_time - start_time
                usage = result.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                total_tokens = usage.get("total_tokens", 0)
                
                tokens_per_second = completion_tokens / response_time if response_time > 0 else 0
                
                return BenchmarkResult(
                    service="vLLM",
                    model="Llama-3.1-8B-Instruct",
                    prompt_tokens=prompt_tokens,
                    completion_tokens=completion_tokens,
                    total_tokens=total_tokens,
                    response_time=response_time,
                    tokens_per_second=tokens_per_second
                )
                
        except Exception as e:
            return BenchmarkResult(
                service="vLLM",
                model="Llama-3.1-8B-Instruct",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                response_time=0,
                tokens_per_second=0,
                error=str(e)
            )
    
    async def test_ollama(self, session: aiohttp.ClientSession, prompt: str, max_tokens: int = 100) -> BenchmarkResult:
        """Test Ollama performance"""
        start_time = time.time()
        
        payload = {
            "model": "llama3.1:8b",
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": 0.7
            }
        }
        
        try:
            async with session.post(f"{self.ollama_url}/api/generate", json=payload) as response:
                if response.status != 200:
                    error_text = await response.text()
                    return BenchmarkResult(
                        service="Ollama",
                        model="llama3.1:8b",
                        prompt_tokens=0,
                        completion_tokens=0,
                        total_tokens=0,
                        response_time=0,
                        tokens_per_second=0,
                        error=f"HTTP {response.status}: {error_text}"
                    )
                
                result = await response.json()
                end_time = time.time()
                
                response_time = end_time - start_time
                
                # Ollama response format
                prompt_eval_count = result.get("prompt_eval_count", 0)
                eval_count = result.get("eval_count", 0)
                total_tokens = prompt_eval_count + eval_count
                
                tokens_per_second = eval_count / response_time if response_time > 0 else 0
                
                return BenchmarkResult(
                    service="Ollama",
                    model="llama3.1:8b",
                    prompt_tokens=prompt_eval_count,
                    completion_tokens=eval_count,
                    total_tokens=total_tokens,
                    response_time=response_time,
                    tokens_per_second=tokens_per_second
                )
                
        except Exception as e:
            return BenchmarkResult(
                service="Ollama",
                model="llama3.1:8b",
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                response_time=0,
                tokens_per_second=0,
                error=str(e)
            )
    
    async def benchmark_service(self, service: str, prompts: List[str], max_tokens: int = 100, runs_per_prompt: int = 3) -> List[BenchmarkResult]:
        """Benchmark a single service"""
        results = []
        
        print(f"\n{'='*60}")
        print(f"BENCHMARKING {service.upper()}")
        print(f"{'='*60}")
        
        async with aiohttp.ClientSession() as session:
            for i, prompt in enumerate(prompts, 1):
                print(f"\nPrompt {i}/{len(prompts)}: {prompt[:50]}...")
                
                for run in range(runs_per_prompt):
                    print(f"  Run {run + 1}/{runs_per_prompt}...", end=" ")
                    
                    if service == "vLLM":
                        result = await self.test_vllm(session, prompt, max_tokens)
                    else:
                        result = await self.test_ollama(session, prompt, max_tokens)
                    
                    results.append(result)
                    
                    # Print quick results
                    if result.error:
                        print(f"ERROR - {result.error}")
                    else:
                        print(f"{result.response_time:.2f}s ({result.tokens_per_second:.1f} tok/s)")
                    
                    # Small delay between runs
                    await asyncio.sleep(2)
        
        return results
    
    async def run_fair_benchmark(self, prompts: List[str], max_tokens: int = 100, runs_per_prompt: int = 3) -> Dict[str, List[BenchmarkResult]]:
        """Run fair benchmark with services running one at a time"""
        print("🏁 Starting Fair LLM Benchmark")
        print(f"📊 Testing {len(prompts)} prompts with {runs_per_prompt} runs each")
        print(f"🎯 Max tokens per completion: {max_tokens}")
        
        all_results = {}
        
        # First, stop all services to ensure clean start
        self.stop_all_services()
        
        # Test vLLM
        if self.start_vllm():
            vllm_results = await self.benchmark_service("vLLM", prompts, max_tokens, runs_per_prompt)
            all_results["vLLM"] = vllm_results
            self.stop_all_services()
        else:
            print("❌ Skipping vLLM benchmark due to startup failure")
            all_results["vLLM"] = []
        
        # Test Ollama
        if self.start_ollama():
            ollama_results = await self.benchmark_service("Ollama", prompts, max_tokens, runs_per_prompt)
            all_results["Ollama"] = ollama_results
            self.stop_all_services()
        else:
            print("❌ Skipping Ollama benchmark due to startup failure")
            all_results["Ollama"] = []
        
        return all_results
    
    def analyze_results(self, results: Dict[str, List[BenchmarkResult]]):
        """Analyze and print benchmark results"""
        print("\n" + "=" * 80)
        print("FAIR BENCHMARK RESULTS ANALYSIS")
        print("=" * 80)
        
        for service_name, service_results in results.items():
            print(f"\n{service_name} Results:")
            print("-" * 40)
            
            # Filter out errors
            valid_results = [r for r in service_results if not r.error]
            error_results = [r for r in service_results if r.error]
            
            if error_results:
                print(f"Errors: {len(error_results)}/{len(service_results)}")
                for error in set(r.error for r in error_results):
                    print(f"  - {error}")
                print()
            
            if not valid_results:
                print("No valid results to analyze.")
                continue
            
            # Calculate statistics
            response_times = [r.response_time for r in valid_results]
            tokens_per_second = [r.tokens_per_second for r in valid_results]
            completion_tokens = [r.completion_tokens for r in valid_results]
            
            print(f"Valid runs: {len(valid_results)}")
            print(f"Response time (avg): {statistics.mean(response_times):.3f}s")
            print(f"Response time (median): {statistics.median(response_times):.3f}s")
            print(f"Response time (min/max): {min(response_times):.3f}s / {max(response_times):.3f}s")
            print(f"Tokens/second (avg): {statistics.mean(tokens_per_second):.1f}")
            print(f"Tokens/second (median): {statistics.median(tokens_per_second):.1f}")
            print(f"Tokens/second (min/max): {min(tokens_per_second):.1f} / {max(tokens_per_second):.1f}")
            print(f"Completion tokens (avg): {statistics.mean(completion_tokens):.1f}")
        
        # Comparison
        vllm_valid = [r for r in results.get("vLLM", []) if not r.error]
        ollama_valid = [r for r in results.get("Ollama", []) if not r.error]
        
        if vllm_valid and ollama_valid:
            print("\n" + "=" * 40)
            print("PERFORMANCE COMPARISON")
            print("=" * 40)
            
            vllm_avg_response = statistics.mean([r.response_time for r in vllm_valid])
            ollama_avg_response = statistics.mean([r.response_time for r in ollama_valid])
            
            vllm_avg_tokens_sec = statistics.mean([r.tokens_per_second for r in vllm_valid])
            ollama_avg_tokens_sec = statistics.mean([r.tokens_per_second for r in ollama_valid])
            
            if vllm_avg_response < ollama_avg_response:
                speedup = ollama_avg_response / vllm_avg_response
                print(f"🏆 vLLM is {speedup:.2f}x FASTER in response time")
            else:
                speedup = vllm_avg_response / ollama_avg_response
                print(f"🏆 Ollama is {speedup:.2f}x FASTER in response time")
            
            if vllm_avg_tokens_sec > ollama_avg_tokens_sec:
                throughput_ratio = vllm_avg_tokens_sec / ollama_avg_tokens_sec
                print(f"🚀 vLLM has {throughput_ratio:.2f}x HIGHER throughput")
            else:
                throughput_ratio = ollama_avg_tokens_sec / vllm_avg_tokens_sec
                print(f"🚀 Ollama has {throughput_ratio:.2f}x HIGHER throughput")

def main():
    parser = argparse.ArgumentParser(description="Fair Benchmark: vLLM vs Ollama")
    parser.add_argument("--max-tokens", type=int, default=100, help="Max tokens per completion")
    parser.add_argument("--runs", type=int, default=3, help="Number of runs per prompt")
    parser.add_argument("--quick", action="store_true", help="Run quick test with fewer prompts")
    
    args = parser.parse_args()
    
    # Test prompts
    if args.quick:
        prompts = [
            "What is the capital of France?",
            "Explain quantum computing in simple terms.",
        ]
    else:
        prompts = [
            "What is the capital of France?",
            "Explain quantum computing in simple terms.",
            "Write a short story about a robot learning to paint.",
            "What are the benefits of renewable energy?",
            "Describe the process of photosynthesis.",
        ]
    
    benchmark = FairLLMBenchmark()
    
    try:
        results = asyncio.run(benchmark.run_fair_benchmark(prompts, args.max_tokens, args.runs))
        benchmark.analyze_results(results)
    except KeyboardInterrupt:
        print("\n🛑 Benchmark interrupted by user.")
        benchmark.stop_all_services()
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Benchmark failed: {e}")
        benchmark.stop_all_services()
        sys.exit(1)

if __name__ == "__main__":
    main()

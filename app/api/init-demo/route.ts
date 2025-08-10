import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * Initialize demo data for production deployment
 * This creates demo documents without relying on local image files
 * The chat will work without images in production
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initializing production-ready demo...');

    const collection = await getCollection();
    const documentId = 'demo-deepseek-r1';

    // Step 1: Clean up any existing demo documents
    await collection.deleteMany({ documentId });
    console.log('🧹 Cleaned up existing demo documents');

    // Step 2: Create demo documents with content but no local image dependencies
    const demoPages = [
      {
        documentId,
        pageNumber: 1,
        content: 'DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning',
        summary: 'Title page introducing DeepSeek-R1, a large language model trained with reinforcement learning to improve reasoning capabilities',
        topics: ['reinforcement learning', 'reasoning', 'large language models', 'DeepSeek', 'AI research'],
        // Create a simple embedding that will work with vector search
        embedding: Array(1024).fill(0).map((_, i) => Math.sin(i * 0.1) * 0.5),
        createdAt: new Date(),
        storageType: 'demo',
        // No image key - works without images
        metadata: {
          isDemo: true,
          description: 'This is a demonstration using the DeepSeek-R1 research paper'
        }
      },
      {
        documentId,
        pageNumber: 2,
        content: 'Abstract: We present DeepSeek-R1, a novel approach to enhancing reasoning capabilities in large language models through reinforcement learning. Our method incentivizes step-by-step reasoning processes.',
        summary: 'Abstract describing the methodology for training reasoning capabilities using reinforcement learning techniques',
        topics: ['abstract', 'methodology', 'training', 'step-by-step reasoning', 'reinforcement learning'],
        embedding: Array(1024).fill(0).map((_, i) => Math.cos(i * 0.15) * 0.6),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 3,
        content: 'Introduction: Recent advances in large language models have shown remarkable capabilities. However, complex reasoning tasks remain challenging. We propose a reinforcement learning approach to address this gap.',
        summary: 'Introduction explaining the motivation and background for developing enhanced reasoning capabilities',
        topics: ['introduction', 'background', 'reasoning challenges', 'motivation', 'LLM capabilities'],
        embedding: Array(1024).fill(0).map((_, i) => Math.sin(i * 0.2) * 0.4),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 4,
        content: 'Related Work: Previous approaches include Chain-of-Thought prompting, Constitutional AI, and RLHF. Our work builds upon these foundations while introducing novel reward mechanisms for reasoning.',
        summary: 'Literature review of previous work in reasoning capabilities and reinforcement learning for LLMs',
        topics: ['related work', 'Chain-of-Thought', 'Constitutional AI', 'RLHF', 'literature review'],
        embedding: Array(1024).fill(0).map((_, i) => Math.cos(i * 0.25) * 0.55),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 5,
        content: 'Methodology: Our approach uses a two-stage training process. First, we pre-train on reasoning datasets. Second, we apply reinforcement learning with carefully designed reward functions that incentivize correct intermediate steps.',
        summary: 'Detailed description of the two-stage training methodology using reinforcement learning',
        topics: ['methodology', 'two-stage training', 'reward functions', 'intermediate steps', 'training process'],
        embedding: Array(1024).fill(0).map((_, i) => Math.sin(i * 0.3) * 0.45),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 6,
        content: 'Experimental Setup: We evaluate on multiple benchmarks including MATH, GSM8K, and custom reasoning tasks. Baselines include GPT-4, Claude, and previous DeepSeek models.',
        summary: 'Description of experimental setup, benchmarks, and baseline models used for evaluation',
        topics: ['experiments', 'benchmarks', 'MATH dataset', 'GSM8K', 'evaluation', 'baselines'],
        embedding: Array(1024).fill(0).map((_, i) => Math.cos(i * 0.35) * 0.65),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 7,
        content: 'Results: DeepSeek-R1 achieves 92.3% on GSM8K and 78.5% on MATH, outperforming baselines. Analysis shows improved step-by-step reasoning with fewer errors in intermediate calculations.',
        summary: 'Quantitative results showing performance improvements on mathematical reasoning benchmarks',
        topics: ['results', 'performance', 'GSM8K', 'MATH', 'improvements', 'quantitative analysis'],
        embedding: Array(1024).fill(0).map((_, i) => Math.sin(i * 0.4) * 0.5),
        createdAt: new Date(),
        storageType: 'demo'
      },
      {
        documentId,
        pageNumber: 8,
        content: 'Conclusion: DeepSeek-R1 demonstrates that reinforcement learning can effectively improve reasoning capabilities. Future work includes extending to multimodal reasoning and longer reasoning chains.',
        summary: 'Conclusion summarizing contributions and discussing future research directions',
        topics: ['conclusion', 'future work', 'multimodal reasoning', 'contributions', 'research directions'],
        embedding: Array(1024).fill(0).map((_, i) => Math.cos(i * 0.45) * 0.6),
        createdAt: new Date(),
        storageType: 'demo'
      }
    ];

    // Step 3: Insert all demo documents
    const result = await collection.insertMany(demoPages);
    console.log(`📊 Inserted ${result.insertedCount} demo documents`);

    return NextResponse.json({
      success: true,
      message: `Initialized demo with ${demoPages.length} pages`,
      documentId,
      pageCount: demoPages.length,
      note: 'This demo works without image files for production deployment',
      pages: demoPages.map(p => ({
        pageNumber: p.pageNumber,
        content: p.content.substring(0, 100) + '...',
        topics: p.topics
      }))
    });

  } catch (error) {
    console.error('❌ Demo initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize demo'
    }, { status: 500 });
  }
}
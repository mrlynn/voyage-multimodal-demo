# Multimodal AI Agent with MongoDB Atlas Vector Search

A Next.js 15.4.5 application demonstrating multimodal document search and analysis using Voyage AI embeddings, MongoDB Atlas Vector Search, and Google's Gemini 2.0 Flash. Built for developers exploring vector search capabilities with PDFs containing both text and visual content.

## 🚀 Features

### Core Functionality
- **Multimodal PDF Processing**: Upload and process PDFs with both text and image content
- **Vector Search**: Powered by Voyage AI's `voyage-multimodal-3` embeddings (1536-dimensional)
- **MongoDB Atlas Integration**: Native vector search with HNSW indexing
- **AI-Powered Chat**: Google Gemini 2.0 Flash for contextual document analysis
- **Real-time Visualization**: Interactive embedding and similarity score displays

### Educational Interface
- **Interactive Pipeline Visualization**: Click-through explanations of the vector search process
- **Similarity Score Analysis**: Visual cosine similarity demonstrations with real-time calculations
- **Technical Deep Dives**: Detailed explanations of Voyage AI's unified transformer architecture
- **Performance Benchmarks**: Live metrics showing 41% improvement over CLIP-based approaches

## 🏗️ Architecture

```
├── app/
│   ├── api/
│   │   ├── chat/           # Chat endpoint with multimodal analysis
│   │   ├── embeddings/     # Voyage AI embedding generation
│   │   ├── pdf/            # PDF processing and page extraction
│   │   ├── sessions/       # Session management
│   │   └── upload/         # File upload handling
│   ├── globals.css         # MongoDB brand design system
│   └── page.tsx           # Main application interface
├── components/
│   ├── educational/        # Interactive learning components
│   │   ├── VectorSearchVisualizer.tsx      # Pipeline visualization
│   │   ├── SimilarityScoreExplainer.tsx    # Cosine similarity demos
│   │   ├── LiveEmbeddingDemo.tsx           # Real-time embedding process
│   │   └── VoyageDetailedSpecs.tsx         # Technical specifications
│   ├── ChatInterfaceEnhanced.tsx           # Multimodal chat UI
│   └── VectorSearchInsights.tsx            # Search result analysis
├── lib/
│   └── services/
│       ├── vectorSearch.ts     # MongoDB Atlas vector operations
│       ├── pdfProcessor.ts     # PDF-to-image conversion
│       └── embeddingService.ts # Voyage AI integration
└── types/                      # TypeScript definitions
```

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 15.4.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling with MongoDB branding
- **MongoDB Atlas** - Database with native vector search

### AI & ML Services
- **Voyage AI** - `voyage-multimodal-3` embeddings
- **Google Gemini 2.0 Flash** - Multimodal AI analysis
- **MongoDB Atlas Vector Search** - HNSW indexing and similarity search

### Key Libraries
- **PDF Processing**: `pdf-poppler` for high-quality image extraction
- **Vector Operations**: Native MongoDB Atlas vector search
- **UI Components**: Custom React components with glassmorphism design

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas cluster with Vector Search enabled
- API keys for Voyage AI and Google AI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/multimodal-ai-agent.git
   cd multimodal-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   MONGODB_DB_NAME=multimodal_search
   
   # Voyage AI
   VOYAGE_API_KEY=your_voyage_api_key
   
   # Google AI
   GOOGLE_API_KEY=your_gemini_api_key
   
   # Vercel Blob Storage (required for production)
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   
   # File Upload Configuration
   MAX_FILE_SIZE=4194304   # 4MB in bytes (Vercel limit)
   
   # Development configuration
   UPLOAD_DIR=./public/uploads
   ```

4. **MongoDB Atlas Vector Search Setup**
   
   Create a vector search index on your collection:
   ```json
   {
     "fields": [
       {
         "type": "vector",
         "path": "embedding",
         "numDimensions": 1536,
         "similarity": "cosine"
       },
       {
         "type": "filter",
         "path": "pageNumber"
       },
       {
         "type": "filter", 
         "path": "documentId"
       }
     ]
   }
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### MongoDB Atlas Vector Search Index

The application requires a properly configured vector search index. Use the MongoDB Atlas UI or CLI to create:

```javascript
// Vector Search Index Definition
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding", 
      "numDimensions": 1536,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "pageNumber"
    },
    {
      "type": "filter",
      "path": "documentId" 
    },
    {
      "type": "filter",
      "path": "metadata.contentType"
    }
  ]
}
```

### Voyage AI Configuration

The application uses `voyage-multimodal-3` for generating embeddings:

```typescript
// lib/services/embeddingService.ts
const response = await fetch('https://api.voyageai.com/v1/embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'voyage-multimodal-3',
    input: content,
    input_type: 'document' // or 'query'
  })
});
```

## 📚 API Reference

### Upload PDF
```http
POST /api/upload
Content-Type: multipart/form-data

Body: FormData with 'file' field containing PDF
```

**Response:**
```json
{
  "success": true,
  "documentId": "uuid",
  "pages": 12,
  "message": "PDF uploaded and processed"
}
```

### Generate Embeddings
```http
POST /api/embeddings
Content-Type: application/json

{
  "documentId": "uuid"
}
```

### Chat with Document
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Find diagrams showing neural network architectures"
}
```

**Response:**
```json
{
  "response": "I found relevant diagrams on pages 3 and 7...",
  "sources": [
    { "page": 3, "score": 0.92 },
    { "page": 7, "score": 0.85 }
  ]
}
```

## 🧪 Understanding the Technology

### Voyage AI Multimodal Embeddings

The application showcases **voyage-multimodal-3**, which offers significant advantages over traditional CLIP-based approaches:

- **Unified Architecture**: Single transformer processes text and images together
- **Layout Awareness**: Understands document structure, fonts, and spacing
- **Performance**: 41% improvement on table/figure retrieval tasks
- **Dimensions**: 1536-dimensional embeddings optimized for similarity search

### Vector Search Process

1. **Query Analysis**: Intent detection and modality weighting
2. **Embedding Generation**: Convert query to 1536-dimensional vector
3. **Vector Search**: MongoDB Atlas HNSW approximate nearest neighbor search
4. **Multimodal Fusion**: Learned combination of text and image similarities

### Educational Features

The interface includes interactive components for learning:
- **Pipeline Visualization**: Click cards to see detailed technical explanations
- **Similarity Scoring**: Visual demonstrations of cosine similarity calculations
- **Performance Metrics**: Real-time search statistics and benchmarks

## 🚀 Deployment

### Vercel (Recommended)

This application is optimized for Vercel deployment with integrated Blob storage for file handling.

#### 1. **Setup Vercel Blob Storage**
   
   Enable Vercel Blob in your Vercel project dashboard:
   - Go to your project settings in Vercel dashboard
   - Navigate to **Storage** → **Create Storage** → **Blob**
   - Create a new Blob store
   - Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

#### 2. **Deploy to Vercel**
   
   ```bash
   npm install -g vercel
   vercel --prod
   ```

#### 3. **Configure Environment Variables**
   
   Set these environment variables in your Vercel dashboard:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   MONGODB_DB_NAME=multimodal_search
   VOYAGE_API_KEY=your_voyage_ai_api_key
   GOOGLE_API_KEY=your_google_ai_api_key
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   NODE_ENV=production
   ```

#### 4. **Storage Architecture**
   
   The application automatically adapts storage based on environment:
   - **Development**: Uses local filesystem (`public/uploads/`)
   - **Production**: Uses Vercel Blob storage (scalable, persistent)
   
   No code changes required - the same codebase works in both environments.

#### 5. **Deployment Features**
   
   - **Automatic scaling**: Handles variable PDF processing loads
   - **Persistent storage**: Blob storage survives deployments
   - **Global CDN**: Fast image loading worldwide
   - **Zero configuration**: Environment detection handles storage switching
   - **Smart file limits**: 4MB default (configurable via `MAX_FILE_SIZE` env var)

#### 6. **File Size Considerations**
   
   **Vercel Limits:**
   - Hobby Plan: ~4.5MB request limit
   - Pro Plan: 50MB request limit
   
   **Recommendations:**
   - Keep PDFs under 4MB for optimal performance
   - Use PDF compression tools for larger files
   - The app includes built-in compression suggestions for oversized files

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Configure MongoDB Atlas whitelist for deployment IP
- Ensure API keys have proper rate limits and billing setup

## 🔍 Development

### Code Structure

- **Services Layer**: Clean separation of concerns for AI/ML operations
- **Type Safety**: Comprehensive TypeScript definitions
- **Component Architecture**: Modular, reusable React components
- **Educational Focus**: Interactive learning components for technical workshops

### Key Design Decisions

1. **MongoDB Atlas Vector Search**: Native database integration vs. separate vector DB
2. **Voyage AI**: Unified multimodal embeddings vs. CLIP dual-tower approach  
3. **Next.js App Router**: Modern React patterns with server components
4. **Educational UI**: Interactive learning prioritized over pure functionality

### Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run development server with debugging
npm run dev
```

## 📈 Performance Benchmarks

Based on Voyage AI's published benchmarks:

| Metric | Voyage Multimodal-3 | CLIP Baseline | Improvement |
|--------|-------------------|---------------|-------------|
| Table/Figure Retrieval | 84.3% | 59.7% | +41.2% |
| Layout Understanding | 91.2% | 73.8% | +23.6% |
| Multimodal Fusion | 88.7% | 76.1% | +16.6% |

*Performance measured on academic document retrieval tasks*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`) 
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use MongoDB design patterns for vector operations
- Maintain educational value in UI components
- Test with various PDF types and sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Voyage AI** - Advanced multimodal embedding technology
- **MongoDB Atlas** - Native vector search capabilities
- **Google AI** - Gemini multimodal analysis
- **Next.js Team** - Modern React development framework

## 📞 Support

- **Documentation**: [Technical Blog Post](https://blog.voyageai.com/2024/11/12/voyage-multimodal-3/)
- **MongoDB Atlas**: [Vector Search Documentation](https://docs.atlas.mongodb.com/atlas-vector-search/)
- **Issues**: [GitHub Issues](https://github.com/your-org/multimodal-ai-agent/issues)

---

**Built with ❤️ for developers exploring the future of multimodal AI and vector search.**
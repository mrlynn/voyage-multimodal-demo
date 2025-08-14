'use client';

import { useState, useEffect } from 'react';
import ProgressFileUpload from '@/components/ProgressFileUpload';
import ChatInterfaceEnhanced from '@/components/ChatInterfaceEnhanced';
import ImageTest from '@/components/ImageTest';
import QuickImageTest from '@/components/QuickImageTest';
import SetupValidation from '@/components/SetupValidation';
import WorkflowVisualization from '@/components/ui/WorkflowVisualization';
import ProgressIndicator from '@/components/ui/ProgressIndicator';
import { FileText, MessageSquare, Settings, Sparkles, ArrowRight, Check, BookOpen, Github, Code, FileJson, Zap, ExternalLink } from 'lucide-react';
import LearnTab from '@/components/educational/LearnTab';
import WelcomeModal from '@/components/WelcomeModal';
import WorkshopFlow from '@/components/WorkshopFlow';

export default function Home() {
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'setup' | 'upload' | 'chat' | 'learn' | 'test'>('setup');
  const [setupComplete, setSetupComplete] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  const steps = [
    { id: 'setup', label: 'Setup' },
    { id: 'upload', label: 'Upload PDF' },
    { id: 'chat', label: 'Chat with AI' }
  ];

  useEffect(() => {
    // Update completed steps based on state
    const completed = [];
    if (setupComplete) completed.push('setup');
    if (pdfUploaded) completed.push('upload');
    setCompletedSteps(completed);
  }, [setupComplete, pdfUploaded]);

  useEffect(() => {
    // Show welcome modal on first visit
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Add a small delay to ensure the component is fully loaded
      setTimeout(() => setShowWelcomeModal(true), 500);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  useEffect(() => {
    // Listen for example PDF demo event
    const handleExamplePDF = (event: CustomEvent) => {
      const { documentId } = event.detail;
      if (documentId) {
        setDocumentId(documentId);
        setPdfUploaded(true);
        setSetupComplete(true);
        setActiveTab('chat');
      }
    };

    window.addEventListener('openChatWithExample', handleExamplePDF as EventListener);
    return () => {
      window.removeEventListener('openChatWithExample', handleExamplePDF as EventListener);
    };
  }, []);

  const handleUploadComplete = (docId: string) => {
    setPdfUploaded(true);
    setDocumentId(docId);
    setTimeout(() => {
      setActiveTab('chat');
    }, 500);
  };

  return (
    <main className="min-h-screen relative">
      {/* Workshop Context Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 text-center">
        <div className="container mx-auto max-w-7xl flex items-center justify-center space-x-2">
          <span className="text-xl">🎓</span>
          <span className="font-semibold">MongoDB AI Workshop Component</span>
          <span className="text-green-100 mx-2">•</span>
          <span className="text-green-100">This interactive demo complements the Python/Jupyter notebook exercises</span>
        </div>
      </div>

      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50 -z-10" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Enhanced header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-600/10 to-emerald-500/10 border border-green-200/50">
            <Sparkles className="w-4 h-4 text-green-700 mr-2" />
            <span className="text-sm font-medium text-green-800">MongoDB AI Workshop</span>
          </div>
          
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Interactive Demo Application</h2>
          
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Build Intelligent</span>
            <br />
            <span className="text-gray-900">Multimodal Agentic AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-4">
            See the concepts from your Jupyter notebooks in action with this live Next.js implementation
          </p>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Transform PDFs into interactive knowledge with cutting-edge
            <span className="font-semibold text-gray-800"> multimodal embeddings</span>
          </p>
        </header>

        {/* Workshop Flow Visualization */}
        <WorkshopFlow />

        {/* Workshop Resources Section */}
        <div className="mb-12">
          <h3 className="text-center text-lg font-semibold text-gray-700 mb-6">📚 Workshop Resources</h3>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            <a
              href="https://github.com/mongodb-developer/ai4-multimodal-agents-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center space-x-3 px-6 py-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              title="Opens in new window"
            >
              <FileJson className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
              <div className="text-left flex-1">
                <span className="font-semibold text-gray-900 group-hover:text-green-700">Jupyter Notebooks</span>
                <p className="text-sm text-gray-600">Theory & Examples</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-2" />
            </a>
            
            <button
              onClick={() => setShowWelcomeModal(true)}
              className="group flex items-center space-x-3 px-6 py-4 bg-green-50 rounded-xl border border-green-200 hover:border-green-500 hover:shadow-lg transition-all duration-300"
            >
              <Zap className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <span className="font-semibold text-green-700">Live Demo</span>
                <p className="text-sm text-green-600">This App • How It Works</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-2" />
            </button>
            
            <a
              href="https://mdb.link/ai4-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center space-x-3 px-6 py-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              title="Opens in new window"
            >
              <BookOpen className="w-5 h-5 text-blue-600 group-hover:text-blue-700" />
              <div className="text-left flex-1">
                <span className="font-semibold text-gray-900 group-hover:text-green-700">Documentation</span>
                <p className="text-sm text-gray-600">Complete Guide</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-2" />
            </a>
            
            <a
              href="https://codespaces.new/mongodb-developer/ai4-multimodal-agents-lab"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center space-x-3 px-6 py-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-300"
              title="Opens in new window"
            >
              <Code className="w-5 h-5 text-purple-600 group-hover:text-purple-700" />
              <div className="text-left flex-1">
                <span className="font-semibold text-gray-900 group-hover:text-green-700">Codespace</span>
                <p className="text-sm text-gray-600">Development Environment</p>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 ml-2" />
            </a>
          </div>
        </div>
      


        {/* Workshop Overview Card */}
        <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Workshop Components</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-orange-600 font-bold">•</span>
              <div>
                <strong className="text-gray-900">Python/Jupyter:</strong>
                <span className="text-gray-700"> Learn the core concepts and algorithms</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-green-600 font-bold">•</span>
              <div>
                <strong className="text-gray-900">Next.js Demo:</strong>
                <span className="text-gray-700"> See the implementation in action</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">•</span>
              <div>
                <strong className="text-gray-900">Hands-on Labs:</strong>
                <span className="text-gray-700"> Build your own multimodal agent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="max-w-2xl mx-auto mb-8">
          <ProgressIndicator 
            steps={steps}
            currentStep={activeTab}
            completedSteps={completedSteps}
          />
        </div>
        
        {/* Workflow visualization */}
        {/* {activeTab === 'setup' && (
          <div className="mb-8">
            <WorkflowVisualization />
          </div>
        )} */}

        {/* Main content card with glassmorphism */}
        <div className="glass rounded-3xl overflow-hidden shadow-2xl w-full">
          {/* Tab navigation with enhanced styling */}
          <div className="flex bg-white/50 backdrop-blur-sm border-b border-gray-200/50 flex-shrink-0 w-full">
            <button
              onClick={() => setActiveTab('setup')}
              className={`
                flex-1 min-w-[120px] px-8 py-5 flex items-center justify-center space-x-3
                transition-all duration-300 relative group
                ${
                  activeTab === 'setup'
                    ? 'text-green-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Settings className={`w-5 h-5 transition-transform group-hover:rotate-90 duration-300`} />
              <span>Setup</span>
              {setupComplete && activeTab !== 'setup' && (
                <Check className="w-4 h-4 text-green-500 ml-1" />
              )}
              {activeTab === 'setup' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              disabled={!setupComplete}
              className={`
                flex-1 min-w-[120px] px-8 py-5 flex items-center justify-center space-x-3
                transition-all duration-300 relative group
                ${
                  activeTab === 'upload'
                    ? 'text-indigo-600 font-semibold'
                    : setupComplete
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <FileText className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
              <span>Upload PDF</span>
              {pdfUploaded && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Ready
                </span>
              )}
              {activeTab === 'upload' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('chat')}
              disabled={!pdfUploaded}
              className={`
                flex-1 min-w-[120px] px-8 py-5 flex items-center justify-center space-x-3
                transition-all duration-300 relative group
                ${
                  activeTab === 'chat'
                    ? 'text-indigo-600 font-semibold'
                    : pdfUploaded
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <MessageSquare className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
              <span>Chat with AI</span>
              {activeTab === 'chat' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500" />
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('learn')}
              className={`
                flex-1 min-w-[120px] px-8 py-5 flex items-center justify-center space-x-3
                transition-all duration-300 relative group
                ${
                  activeTab === 'learn'
                    ? 'text-green-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <BookOpen className={`w-5 h-5 transition-transform group-hover:scale-110 duration-300`} />
              <span>Learn</span>
              {activeTab === 'learn' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-emerald-500" />
              )}
            </button>
          </div>

          {/* Content area with smooth transitions */}
          <div className="p-6 bg-white/70">
            <div className="transition-all duration-500">
              {activeTab === 'setup' ? (
                <div>
                  <SetupValidation />
                  {/* Next step button */}
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => {
                        setSetupComplete(true);
                        setActiveTab('upload');
                      }}
                      className="
                        flex items-center space-x-2 px-6 py-3
                        bg-gradient-to-r from-green-600 to-emerald-600
                        text-white font-medium rounded-xl
                        hover:from-green-700 hover:to-emerald-700
                        transform transition-all duration-300 hover:scale-105
                        shadow-lg hover:shadow-xl
                      "
                    >
                      <span>Continue to Upload</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : activeTab === 'upload' ? (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Upload Your Document
                    </h2>
                    <p className="text-gray-600">
                      Our AI will extract and analyze both text and images
                    </p>
                  </div>
                  <ProgressFileUpload onUploadComplete={handleUploadComplete} />
                </div>
              ) : activeTab === 'chat' ? (
                <div className="h-[600px]">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Chat with Your Document
                    </h2>
                    <p className="text-gray-600">
                      Ask questions about the content, images, or any details
                    </p>
                  </div>
                  <ChatInterfaceEnhanced documentId={documentId} />
                </div>
              ) : activeTab === 'learn' ? (
                <div>
                  <LearnTab />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Debug Panel */}
        {activeTab === 'test' && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-center">
              <QuickImageTest />
            </div>
            <ImageTest />
          </div>
        )}
        
        {/* Enhanced footer */}
        <footer className="mt-12 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-500" />
              <span>MongoDB Atlas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
              <span>Voyage AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
              <span>Google Gemini</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            MongoDB AI Workshop • Part 2: Interactive Demo Application • Built with Next.js 15 & TypeScript
            <button 
              onClick={() => setActiveTab('test')}
              className="ml-4 text-indigo-600 hover:text-indigo-800 underline"
            >
              Debug Images
            </button>
          </p>
        </footer>
      </div>
      
      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal} 
      />
    </main>
  );
}


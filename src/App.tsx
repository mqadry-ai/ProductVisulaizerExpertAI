/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Sun, 
  Box, 
  Info,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeProductTransformation, AnalysisResult, generateProductVisual } from './services/geminiService';
import { cn } from '@/lib/utils';

type Fidelity = "High Similarity" | "Creative Variation";

export default function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [fidelity, setFidelity] = useState<Fidelity>("High Similarity");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'source' | 'reference') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'source') setSourceImage(reader.result as string);
        else setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    if (!sourceImage || !referenceImage) return;
    
    setIsAnalyzing(true);
    setGeneratedImageUrl(null);
    setError(null);
    try {
      const analysis = await analyzeProductTransformation(sourceImage, referenceImage, fidelity);
      setResult(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateVisual = async () => {
    if (!sourceImage || !result) return;

    setIsGeneratingImage(true);
    setError(null);
    try {
      const imageUrl = await generateProductVisual(sourceImage, result);
      setGeneratedImageUrl(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate visual");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const reset = () => {
    setSourceImage(null);
    setReferenceImage(null);
    setResult(null);
    setGeneratedImageUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 selection:bg-zinc-700">
      {/* Header */}
      <header className="border-b border-zinc-800/50 bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-zinc-900" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight uppercase">Visualizer Expert</h1>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Studio Edition v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="border-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0">
              AI POWERED
            </Badge>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100" onClick={reset}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Input */}
          <div className="space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Workspace</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Source Product Upload */}
                <div className="space-y-3">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Source Product</label>
                  <div 
                    className={cn(
                      "relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden",
                      sourceImage ? "border-zinc-700" : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/30"
                    )}
                  >
                    {sourceImage ? (
                      <img src={sourceImage} alt="Source" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-6 h-6 text-zinc-600 mb-2 group-hover:text-zinc-400 transition-colors" />
                        <p className="text-xs text-zinc-500">Drop source product</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleImageUpload(e, 'source')}
                      accept="image/*"
                    />
                  </div>
                </div>

                {/* Reference Style Upload */}
                <div className="space-y-3">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Reference Style</label>
                  <div 
                    className={cn(
                      "relative aspect-square rounded-2xl border-2 border-dashed transition-all duration-300 group overflow-hidden",
                      referenceImage ? "border-zinc-700" : "border-zinc-800 hover:border-zinc-600 bg-zinc-900/30"
                    )}
                  >
                    {referenceImage ? (
                      <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-6 h-6 text-zinc-600 mb-2 group-hover:text-zinc-400 transition-colors" />
                        <p className="text-xs text-zinc-500">Drop style reference</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => handleImageUpload(e, 'reference')}
                      accept="image/*"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-zinc-500" />
                <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Configuration</h2>
              </div>
              
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-3">
                    <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Style Fidelity</label>
                    <Tabs value={fidelity} onValueChange={(v) => setFidelity(v as Fidelity)} className="w-full">
                      <TabsList className="grid grid-cols-2 bg-zinc-950 border border-zinc-800 h-11 p-1">
                        <TabsTrigger value="High Similarity" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-xs">
                          High Similarity
                        </TabsTrigger>
                        <TabsTrigger value="Creative Variation" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-xs">
                          Creative Variation
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                      {fidelity === "High Similarity" 
                        ? "Replicates the reference composition, lighting, and environment as closely as possible."
                        : "Maintains the mood and lighting but introduces unique background elements and perspectives."}
                    </p>
                  </div>

                  <Button 
                    className="w-full h-12 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-semibold transition-all disabled:opacity-50"
                    disabled={!sourceImage || !referenceImage || isAnalyzing}
                    onClick={handleAnalyze}
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing Scene...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Visualization Plan
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="min-h-[600px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-4 h-4 text-zinc-500" />
              <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-500">Expert Analysis</h2>
            </div>

            <Card className="flex-1 bg-zinc-900/30 border-zinc-800 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {!result && !isAnalyzing && !error && (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                      <Box className="w-8 h-8 text-zinc-700" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Ready for Analysis</h3>
                    <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                      Upload your product and reference style to generate a professional visualization plan.
                    </p>
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center p-12"
                  >
                    <div className="relative w-24 h-24 mb-8">
                      <motion.div 
                        className="absolute inset-0 border-2 border-zinc-800 rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
                      </div>
                    </div>
                    <div className="space-y-2 text-center">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-zinc-300">Processing Neural Engine</h3>
                      <p className="text-xs text-zinc-500 font-mono">Analyzing textures, lighting vectors, and geometry...</p>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div 
                    key="error"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                  >
                    <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
                    <h3 className="text-lg font-medium text-red-400 mb-2">Analysis Failed</h3>
                    <p className="text-sm text-zinc-500 mb-6">{error}</p>
                    <Button variant="outline" className="border-zinc-800" onClick={handleAnalyze}>
                      Try Again
                    </Button>
                  </motion.div>
                )}

                {result && !isAnalyzing && (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col"
                  >
                    <ScrollArea className="flex-1">
                      <div className="p-8 space-y-10">
                        {/* Summary Header */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-zinc-100 text-zinc-900 hover:bg-zinc-100">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Analysis Complete
                            </Badge>
                            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                              {fidelity} Mode
                            </span>
                          </div>
                          <h3 className="text-2xl font-light tracking-tight text-zinc-100 leading-tight">
                            Visualization Blueprint
                          </h3>
                        </div>

                        <Separator className="bg-zinc-800/50" />

                        {/* Scene Description */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Box className="w-4 h-4 text-zinc-500" />
                            <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Scene Composition</h4>
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed font-light">
                            {result.sceneDescription}
                          </p>
                        </div>

                        {/* Lighting Setup */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4 text-zinc-500" />
                            <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Lighting Setup</h4>
                          </div>
                          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50">
                            <p className="text-sm text-zinc-400 font-mono leading-relaxed">
                              {result.lightingSetup}
                            </p>
                          </div>
                        </div>

                        {/* Textures */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-zinc-500" />
                            <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Material & Textures</h4>
                          </div>
                          <p className="text-sm text-zinc-300 leading-relaxed font-light">
                            {result.backgroundTextures}
                          </p>
                        </div>

                        {/* Differences (Variation only) */}
                        {result.differences && (
                          <div className="space-y-4 p-6 rounded-2xl bg-zinc-100/5 border border-zinc-100/10">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-zinc-400" />
                              <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">Creative Divergence</h4>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed font-light italic">
                              {result.differences}
                            </p>
                          </div>
                        )}

                        {/* Generated Image Section */}
                        <Separator className="bg-zinc-800/50" />
                        
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-zinc-500" />
                              <h4 className="text-[11px] font-mono uppercase tracking-widest text-zinc-500">Visual Output</h4>
                            </div>
                            {!generatedImageUrl && (
                              <Button 
                                size="sm" 
                                className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-8 text-[10px] font-bold uppercase tracking-wider"
                                onClick={handleGenerateVisual}
                                disabled={isGeneratingImage}
                              >
                                {isGeneratingImage ? (
                                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                ) : (
                                  <Sparkles className="w-3 h-3 mr-2" />
                                )}
                                Render Preview
                              </Button>
                            )}
                          </div>

                          <div className="relative aspect-square rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden group">
                            {isGeneratingImage ? (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                                <div className="w-12 h-12 border-2 border-zinc-800 border-t-zinc-400 rounded-full animate-spin" />
                                <p className="text-xs font-mono text-zinc-500 animate-pulse">Synthesizing pixels...</p>
                              </div>
                            ) : generatedImageUrl ? (
                              <>
                                <img 
                                  src={generatedImageUrl} 
                                  alt="Generated Visual" 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = generatedImageUrl;
                                      link.download = 'product-visualization.png';
                                      link.click();
                                    }}
                                  >
                                    Download Render
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <ImageIcon className="w-12 h-12 text-zinc-800 mb-4" />
                                <p className="text-xs text-zinc-600 font-mono">Visual preview will appear here after rendering</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                    
                    <div className="p-6 border-t border-zinc-800 bg-zinc-950/50">
                      <Button variant="outline" className="w-full border-zinc-800 text-zinc-400 hover:text-zinc-100" onClick={() => window.print()}>
                        Export Blueprint (PDF)
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            © 2026 Visualizer Expert Studio • Neural Analysis Engine
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors">Documentation</a>
            <a href="#" className="text-[10px] font-mono text-zinc-600 hover:text-zinc-400 uppercase tracking-widest transition-colors">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

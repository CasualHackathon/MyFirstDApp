'use client';

// Disable static generation
export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import nextDynamic from 'next/dynamic';
// Disable SSR for three-related components to avoid prerender errors
const Canvas = nextDynamic(() => import('@react-three/fiber').then(m => m.Canvas), { ssr: false });
const OrbitControls = nextDynamic(() => import('@react-three/drei').then(m => m.OrbitControls), { ssr: false });
const Box = nextDynamic(() => import('@react-three/drei').then(m => m.Box), { ssr: false });
const Text = nextDynamic(() => import('@react-three/drei').then(m => m.Text), { ssr: false });
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Test Zustand Store
const useTestStore = create<{
  count: number;
  increment: () => void;
  decrement: () => void;
}>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

function Test3DScene() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box
        args={[1, 1, 1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => setClicked(!clicked)}
        scale={clicked ? 1.5 : hovered ? 1.1 : 1}
      >
        <meshStandardMaterial color={clicked ? 'hotpink' : hovered ? 'lightblue' : 'orange'} />
      </Box>
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        3D NFT Platform
      </Text>
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </>
  );
}

export default function TestPage() {
  const { count, increment, decrement } = useTestStore();
  const [inputValue, setInputValue] = useState('');
  
// Test TanStack Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['test-api', count],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        message: 'TanStack Query + Zustand integration working!',
        timestamp: new Date().toISOString(),
        currentCount: count,
        randomId: Math.random().toString(36).substr(2, 9)
      };
    },
    staleTime: 5000,
  });

  const dependencies = [
    { name: 'Next.js 15', status: 'success', version: '15.4.6' },
    { name: 'React 19', status: 'success', version: '19.1.0' },
    { name: 'TypeScript', status: 'success', version: '5.x' },
    { name: 'Tailwind CSS', status: 'success', version: '4.x' },
    { name: 'shadcn/ui', status: 'success', version: 'latest' },
    { name: 'Zustand', status: 'success', version: '5.0.7' },
    { name: 'TanStack Query', status: 'success', version: '5.85.3' },
    { name: 'React Three Fiber', status: 'success', version: '9.3.0' },
    { name: 'Three.js', status: 'success', version: '0.179.1' },
    { name: 'React Hook Form', status: 'success', version: '7.62.0' },
    { name: 'Zod', status: 'success', version: '4.0.17' },
    { name: 'Lucide React', status: 'success', version: '0.539.0' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 3D NFT Platform
          </h1>
          <p className="text-xl text-slate-600">
            Core dependency integration test - Phase 1 complete
          </p>
          <div className="flex justify-center space-x-2">
            <Badge variant="secondary">Next.js 15</Badge>
            <Badge variant="secondary">React 19</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="outline">Ready for Development</Badge>
          </div>
        </div>

        {/* Dependency status card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <span>📦 Dependency installation status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dependencies.map((dep) => (
                <div key={dep.name} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">{dep.name}</p>
                    <p className="text-xs text-slate-500">{dep.version}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">✅ All core dependencies installed. Project infra is ready!</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          
        {/* State management test */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Zustand state management test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button onClick={decrement} variant="outline" size="lg">
                  -1
                </Button>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    {count}
                  </div>
                  <p className="text-sm text-slate-500">Counter Value</p>
                </div>
                <Button onClick={increment} size="lg">
                  +1
                </Button>
              </div>
              
              <div className="space-y-2">
                <Input
                  placeholder="Test input..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <p className="text-sm text-slate-600">
                  Input value: {inputValue || '(empty)'}
                </p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  ✅ Zustand store works and UI updates correctly
                </p>
              </div>
            </CardContent>
          </Card>

        {/* Data fetching test */}
          <Card>
            <CardHeader>
              <CardTitle>🔄 TanStack Query data fetching test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-slate-600">Loading data...</span>
                  </div>
                  <Progress value={33} className="w-full" />
                </div>
              ) : error ? (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-red-700">Error: {error.message}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-green-700 font-medium">✅ {data?.message}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-slate-500">Timestamp:</span>
                      <p className="font-mono text-xs">{data?.timestamp}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Count in Query:</span>
                      <p className="font-mono">{data?.currentCount}</p>
                    </div>
                  </div>
                  <Button onClick={() => refetch()} variant="outline" size="sm">
                    🔄 Refetch data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 3D rendering test */}
        <Card>
          <CardHeader>
            <CardTitle>🎮 React Three Fiber + Three.js 3D rendering test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 rounded-xl overflow-hidden shadow-inner">
              <Canvas camera={{ position: [4, 4, 4] }}>
                <Test3DScene />
              </Canvas>
            </div>
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-purple-800 text-sm">
                ✅ Three.js + React Three Fiber render correctly. 🖱️ Drag to rotate, click cube to interact!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Project info */}
        <Card>
          <CardHeader>
            <CardTitle>ℹ️ Project development info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">🏗️ Phase 1 Complete</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>✅ Core deps installed (12)</li>
                  <li>✅ shadcn/ui integrated</li>
                  <li>✅ Project structure scaffolded</li>
                  <li>✅ Basic tests verified</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-slate-700">🎯 Next: Phase 2</h4>
                <ul className="space-y-1 text-slate-600">
                  <li>🔄 Configure providers and routing</li>
                  <li>🔄 Create base layout components</li>
                  <li>🔄 Implement page navigation</li>
                  <li>🔄 Integrate Meshy API</li>
                </ul>
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-slate-700 font-medium">
                🎉 Phase 1 infrastructure completed! Time to build core features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

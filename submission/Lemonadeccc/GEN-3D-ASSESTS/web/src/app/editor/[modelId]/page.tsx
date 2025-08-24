import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit3 } from 'lucide-react';

interface EditorPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { modelId } = await params;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Edit3 className="mr-2 h-4 w-4" />
            3D Editor
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            3D Model Editor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Edit and optimize model {modelId}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editor feature in development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The 3D model editor is under development. Stay tuned...
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Model ID: {modelId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

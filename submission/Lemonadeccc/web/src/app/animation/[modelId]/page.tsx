import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

interface AnimationPageProps {
  params: Promise<{
    modelId: string;
  }>;
}

export default async function AnimationPage({ params }: AnimationPageProps) {
  const { modelId } = await params;
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <Play className="mr-2 h-4 w-4" />
            Animation Studio
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            3D Model Animation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Add animations for model {modelId}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Animation feature in development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              3D model animation is under development. Stay tuned...
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

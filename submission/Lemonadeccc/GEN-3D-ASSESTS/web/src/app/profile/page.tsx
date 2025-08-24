// 禁用静态生成
export const dynamic = 'force-dynamic';

import { Navbar } from '@/components/web3/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <Badge variant="secondary" className="text-sm">
            <User className="mr-2 h-4 w-4" />
            User Center
          </Badge>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your 3D NFT assets and settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Center under development</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The user center is under development. Stay tuned...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

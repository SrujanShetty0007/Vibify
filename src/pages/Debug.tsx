import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Debug = () => {
    const { user, userProfile, loading } = useAuth();

    const checkFirestore = async () => {
        try {
            const { doc, getDoc } = await import('firebase/firestore');
            const testDoc = await getDoc(doc(db, 'test', 'test'));
            console.log('Firestore test:', testDoc.exists() ? 'Success' : 'No document');
            alert('Firestore connection successful!');
        } catch (error: any) {
            console.error('Firestore error:', error);
            alert(`Firestore error: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-2xl mx-auto space-y-4">
                <h1 className="text-2xl font-bold">Debug Information</h1>

                <Card>
                    <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>API Key:</span>
                            <span className={import.meta.env.VITE_FIREBASE_API_KEY ? 'text-green-500' : 'text-red-500'}>
                                {import.meta.env.VITE_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Auth Domain:</span>
                            <span className={import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'text-green-500' : 'text-red-500'}>
                                {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✓ Set' : '✗ Missing'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Project ID:</span>
                            <span className={import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'text-green-500' : 'text-red-500'}>
                                {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✓ Set' : '✗ Missing'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Storage Bucket:</span>
                            <span className={import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? 'text-green-500' : 'text-red-500'}>
                                {import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✓ Set' : '✗ Missing'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Authentication State</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Loading:</span>
                            <span className={loading ? 'text-yellow-500' : 'text-green-500'}>
                                {loading ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>User:</span>
                            <span className={user ? 'text-green-500' : 'text-red-500'}>
                                {user ? `✓ ${user.email}` : '✗ Not logged in'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>User Profile:</span>
                            <span className={userProfile ? 'text-green-500' : 'text-red-500'}>
                                {userProfile ? `✓ ${userProfile.name}` : '✗ Not loaded'}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Firebase Services</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Auth:</span>
                            <span className="text-green-500 text-sm">✓ Initialized</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm">Firestore:</span>
                            <Button onClick={checkFirestore} size="sm" variant="outline">
                                Test Connection
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {user && userProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle>User Profile Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded overflow-auto">
                                {JSON.stringify(userProfile, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                )}

                <div className="flex gap-2">
                    <Button onClick={() => window.location.href = '/'}>
                        Go to Dashboard
                    </Button>
                    <Button onClick={() => window.location.href = '/auth'} variant="outline">
                        Go to Auth
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Debug;

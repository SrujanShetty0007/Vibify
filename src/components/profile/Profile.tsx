import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Camera, Save, Loader2 } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [name, setName] = useState(userProfile?.name || '');
  const [customStatus, setCustomStatus] = useState(userProfile?.customStatus || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const initials = userProfile?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    toast.error('Photo upload is currently disabled. Please enable Firebase Storage.');
    return;

    /* Commented out until Storage is enabled
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);
      await updateUserProfile({ photoURL });
      toast.success('Photo updated!');
    } catch (error) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
    */
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        name: name.trim(),
        customStatus: customStatus.trim(),
      });
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userProfile?.photoURL} alt={userProfile?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
          <CardTitle>{userProfile?.name}</CardTitle>
          <CardDescription>{userProfile?.email}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status Message</Label>
            <Textarea
              id="status"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="What's on your mind?"
              className="resize-none"
              rows={2}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {customStatus.length}/100
            </p>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;

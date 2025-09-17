"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateUser, UpdateUserData } from "@/lib/actions/users";
import { BannerUpload } from "@/components/banner-upload";
import {
  User,
  Globe,
  Eye,
  EyeOff,
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon,
  Palette,
  Image as ImageIcon,
  Bell,
  Trophy
} from "lucide-react";
import Image from "next/image";

interface ProfileEditPageProps {
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    avatarUrl: string | null;
    createdAt: Date;
    // Gunpla Sekai specific fields
    bio: string | null;
    instagramUrl: string | null;
    twitterUrl: string | null;
    youtubeUrl: string | null;
    portfolioUrl: string | null;
    bannerImageUrl: string | null;
    themeColor: string | null;
    isPublic: boolean;
    showCollections: boolean;
    showBuilds: boolean;
    showActivity: boolean;
    showBadges: boolean;
    emailNotifications: boolean;
  };
}

export function ProfileEditPage({ user }: ProfileEditPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bio: user.bio || "",
    instagramUrl: user.instagramUrl || "",
    twitterUrl: user.twitterUrl || "",
    youtubeUrl: user.youtubeUrl || "",
    portfolioUrl: user.portfolioUrl || "",
    bannerImageUrl: user.bannerImageUrl || "",
    themeColor: user.themeColor || "#3B82F6",
    isPublic: user.isPublic,
    showCollections: user.showCollections,
    showBuilds: user.showBuilds,
    showActivity: user.showActivity,
    showBadges: user.showBadges,
    emailNotifications: user.emailNotifications,
  });

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(false);
  };


  const handleBannerUploaded = (url: string) => {
    setFormData(prev => ({
      ...prev,
      bannerImageUrl: url,
    }));
    setError(null);
    setSuccess(false);
  };

  const handleBannerRemoved = () => {
    setFormData(prev => ({
      ...prev,
      bannerImageUrl: "",
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData: UpdateUserData = {
        bio: formData.bio || null,
        instagramUrl: formData.instagramUrl || null,
        twitterUrl: formData.twitterUrl || null,
        youtubeUrl: formData.youtubeUrl || null,
        portfolioUrl: formData.portfolioUrl || null,
        bannerImageUrl: formData.bannerImageUrl || null,
        themeColor: formData.themeColor,
        isPublic: formData.isPublic,
        showCollections: formData.showCollections,
        showBuilds: formData.showBuilds,
        showActivity: formData.showActivity,
        showBadges: formData.showBadges,
        emailNotifications: formData.emailNotifications,
      };

      const result = await updateUser(user.id, updateData);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          if (user.username) {
            router.push(`/users/${user.username}`);
          } else {
            router.push("/");
          }
        }, 1500);
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Profile update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.username || "User";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Customize your Gunpla Sekai profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              About Me
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About Me</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={handleInputChange("bio")}
                placeholder="Tell the Gunpla community about yourself! (e.g., 'Gunpla builder from Manila, specializing in custom paint jobs.')"
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Links & Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={formData.instagramUrl}
                  onChange={handleInputChange("instagramUrl")}
                  placeholder="https://instagram.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitterUrl" className="flex items-center gap-2">
                  <Twitter className="w-4 h-4" />
                  Twitter/X
                </Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={handleInputChange("twitterUrl")}
                  placeholder="https://twitter.com/yourusername"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Label>
                <Input
                  id="youtubeUrl"
                  type="url"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange("youtubeUrl")}
                  placeholder="https://youtube.com/@yourchannel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioUrl" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Portfolio/Website
                </Label>
                <Input
                  id="portfolioUrl"
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={handleInputChange("portfolioUrl")}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Profile Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <BannerUpload
              currentBannerUrl={formData.bannerImageUrl}
              onBannerUploaded={handleBannerUploaded}
              onBannerRemoved={handleBannerRemoved}
              userId={user.id}
            />
            <div className="space-y-2">
              <Label htmlFor="themeColor">Theme Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="themeColor"
                  type="color"
                  value={formData.themeColor}
                  onChange={handleInputChange("themeColor")}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={formData.themeColor}
                  onChange={handleInputChange("themeColor")}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Make profile public</Label>
                  <p className="text-sm text-gray-500">Allow others to view your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleInputChange("isPublic")}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className={`text-base ${!formData.isPublic ? 'text-gray-400' : ''}`}>Show my collections</Label>
                  <p className={`text-sm ${!formData.isPublic ? 'text-gray-400' : 'text-gray-500'}`}>
                    Display your kit collections publicly
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showCollections}
                  onChange={handleInputChange("showCollections")}
                  disabled={!formData.isPublic}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className={`text-base ${!formData.isPublic ? 'text-gray-400' : ''}`}>Show my builds</Label>
                  <p className={`text-sm ${!formData.isPublic ? 'text-gray-400' : 'text-gray-500'}`}>
                    Display your build gallery publicly
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showBuilds}
                  onChange={handleInputChange("showBuilds")}
                  disabled={!formData.isPublic}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className={`text-base ${!formData.isPublic ? 'text-gray-400' : ''}`}>Show my activity feed</Label>
                  <p className={`text-sm ${!formData.isPublic ? 'text-gray-400' : 'text-gray-500'}`}>
                    Display your recent activity publicly
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showActivity}
                  onChange={handleInputChange("showActivity")}
                  disabled={!formData.isPublic}
                  className="w-4 h-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className={`text-base ${!formData.isPublic ? 'text-gray-400' : ''}`}>Show my badges</Label>
                  <p className={`text-sm ${!formData.isPublic ? 'text-gray-400' : 'text-gray-500'}`}>
                    Display earned badges and achievements
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.showBadges}
                  onChange={handleInputChange("showBadges")}
                  disabled={!formData.isPublic}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Email notifications</Label>
                  <p className="text-sm text-gray-500">Receive email updates about your activity</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange("emailNotifications")}
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section (UI Only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Badges & Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Coming Soon!</p>
              <p className="text-sm">Badge system will be implemented in a future update</p>
            </div>
          </CardContent>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">Profile updated successfully!</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

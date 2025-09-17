"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Twitter, Facebook, MessageSquare } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ToastSimple } from "./ui/toast-simple";

interface ShareButtonProps {
  buildId: string;
  buildTitle: string;
  buildUrl?: string;
}

export function ShareButton({ buildId, buildTitle, buildUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const { toasts, showToast, removeToast } = useToast();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = buildUrl || `${baseUrl}/builds/${buildId}`;

  // Fetch share data when component mounts
  React.useEffect(() => {
    const fetchShareData = async () => {
      try {
        const response = await fetch(`/api/builds/${buildId}/share`);
        if (response.ok) {
          const data = await response.json();
          setShareData(data);
        }
      } catch (error) {
        console.error("Failed to fetch share data:", error);
      }
    };

    fetchShareData();
  }, [buildId]);

  const shareText = shareData?.description || `Check out this Gunpla build: ${buildTitle}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: string) => {
    let url = "";

    switch (platform) {
      case "twitter":
        const twitterText = shareData ? `${shareData.title} - ${shareData.description}` : shareText;
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "reddit":
        const redditTitle = shareData ? shareData.title : buildTitle;
        url = `https://reddit.com/submit?title=${encodeURIComponent(redditTitle)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      default:
        return;
    }

    window.open(url, "_blank", "width=600,height=400");
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Share this build</h3>

              {/* Copy Link */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="w-full justify-start gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Link copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy link</span>
                    </>
                  )}
                </Button>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSocialShare("twitter")}
                    className="flex flex-col items-center gap-1 p-2 h-auto"
                  >
                    <Twitter className="h-4 w-4 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSocialShare("facebook")}
                    className="flex flex-col items-center gap-1 p-2 h-auto"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSocialShare("reddit")}
                    className="flex flex-col items-center gap-1 p-2 h-auto"
                  >
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <span className="text-xs">Reddit</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Render toasts */}
      {toasts.map(toast => (
        <ToastSimple
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

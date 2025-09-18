"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check, Twitter, Facebook, MessageSquare, ExternalLink } from "lucide-react";
import { useToast } from "./ui/use-toast";
import { ToastSimple } from "./ui/toast-simple";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  buildId: string;
  buildTitle: string;
  buildUrl?: string;
}

export function ShareButton({ buildId, buildTitle, buildUrl }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const { toasts, showToast, removeToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = buildUrl || `${baseUrl}/builds/${buildId}`;

  // Fetch share data when component mounts
  React.useEffect(() => {
    const fetchShareData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/builds/${buildId}/share`);
        if (response.ok) {
          const data = await response.json();
          setShareData(data);
        } else {
          console.warn("Failed to fetch share data, using fallback");
        }
      } catch (error) {
        console.error("Failed to fetch share data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShareData();
  }, [buildId]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const shareText = shareData?.description || `Check out this Gunpla build: ${buildTitle}`;

  const handleCopyLink = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link. Please try again.", "error");
    }
  }, [shareUrl, showToast]);

  const handleSocialShare = useCallback((platform: string) => {
    let url = "";

    try {
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

      const popup = window.open(url, "_blank", "width=600,height=400,scrollbars=yes,resizable=yes");

      if (!popup) {
        showToast("Popup blocked. Please allow popups for this site.", "error");
        return;
      }

      showToast(`Opening ${platform}...`, "default");
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
      showToast(`Failed to share on ${platform}. Please try again.`, "error");
    }
  }, [shareData, shareText, shareUrl, buildTitle, showToast]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 transition-all duration-200",
          "hover:scale-105 active:scale-95",
          isOpen && "bg-blue-50 border-blue-200"
        )}
      >
        <Share2 className={cn(
          "h-4 w-4 transition-transform duration-200",
          isOpen && "rotate-12"
        )} />
        Share
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10 animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className={cn(
            "absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20",
            "animate-in slide-in-from-top-2 fade-in duration-200"
          )}>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Share this build</h3>

              {/* Copy Link */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className={cn(
                    "w-full justify-start gap-2 transition-all duration-200",
                    "hover:bg-gray-50 hover:scale-[1.02]"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600 animate-in zoom-in duration-200" />
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

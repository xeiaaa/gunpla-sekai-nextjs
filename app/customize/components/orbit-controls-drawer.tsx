"use client";

import { HelpCircle, Mouse, Hand, ZoomIn } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function OrbitControlsDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur-sm border border-border shadow-lg hover:bg-background transition-colors"
          title="3D Model Controls Guide"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] px-6">
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            3D Model Controls
          </SheetTitle>
          <SheetDescription>
            Learn how to interact with the 3D model
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-0 overflow-y-auto flex-1">
          {/* Mouse Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Mouse className="w-4 h-4" />
              Mouse Controls
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Rotate</div>
                <div className="text-sm text-muted-foreground">
                  Left click + drag to rotate around the model
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Zoom</div>
                <div className="text-sm text-muted-foreground">
                  Mouse wheel up/down to zoom in/out
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Pan</div>
                <div className="text-sm text-muted-foreground">
                  Right click + drag to move the camera around
                </div>
              </div>
            </div>
          </div>

          {/* Trackpad Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Hand className="w-4 h-4" />
              Trackpad Controls
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Rotate</div>
                <div className="text-sm text-muted-foreground">
                  One finger drag to rotate around the model
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Zoom</div>
                <div className="text-sm text-muted-foreground">
                  Pinch to zoom in/out (two fingers)
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Pan</div>
                <div className="text-sm text-muted-foreground">
                  Two finger drag to move the camera around
                </div>
              </div>
            </div>
          </div>

          {/* Touch Controls */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <ZoomIn className="w-4 h-4" />
              Touch Controls
            </h3>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Rotate</div>
                <div className="text-sm text-muted-foreground">
                  One finger drag to rotate around the model
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Zoom</div>
                <div className="text-sm text-muted-foreground">
                  Pinch to zoom in/out (two fingers)
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="font-medium text-sm mb-1">Pan</div>
                <div className="text-sm text-muted-foreground">
                  Two finger drag to move the camera around
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Tips</h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div>• Hold Shift while dragging to pan instead of rotate</div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

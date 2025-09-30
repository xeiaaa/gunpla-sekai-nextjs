"use client";

import { HelpCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function HelpDrawer() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-background/95 backdrop-blur-sm border border-border shadow-lg transition-colors"
          title="Help & Tutorial"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] px-6">
        <SheetHeader className="px-0">
          <SheetTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Help & Tutorial
          </SheetTitle>
          <SheetDescription>
            Learn how to use the 3D customization tool
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6 px-0 overflow-y-auto flex-1 max-h-[calc(100vh-120px)]">
          {/* Getting Started */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              Getting Started
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Welcome to the 3D Gunpla Customization tool! This interface allows
              you to customize the colors and finishes of the Sazabi model in
              real-time.
            </p>
          </div>

          {/* Parts Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              1. Selecting Parts
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Click on any part category in the left sidebar (e.g., Head,
                  Body, Arms)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  The category will expand to show individual materials
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Select a specific material to customize it</span>
              </li>
            </ul>
          </div>

          {/* Customization Panel */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              2. Customization Options
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once you select a material, the middle panel will show
              customization options:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Color Picker:</strong> Choose any color for the
                  selected part
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Finish Types:</strong> Apply different surface
                  finishes (Glossy, Matte, Metallic, etc.)
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Paint Type:</strong> Switch between Solid and Clear
                  paint
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              3. Quick Actions
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The customization panel includes powerful quick action buttons:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Randomize All:</strong> Apply random colors to all
                  parts
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Randomize w/ Blocking:</strong> Group similar parts
                  with the same color
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Randomize Armor:</strong> Only randomize the armor
                  pieces
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Everything Clear:</strong> Make all parts transparent
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Clear Outer Armor:</strong> Make only armor
                  transparent
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Reset All:</strong> Return to default Sazabi colors
                </span>
              </li>
            </ul>
          </div>

          {/* 3D Controls */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              4. 3D Model Controls
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Rotate:</strong> Click and drag to rotate the model
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Zoom:</strong> Scroll to zoom in/out
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Pan:</strong> Right-click and drag to move the model
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Orbit Controls:</strong> Use the orbit button to reset
                  camera position
                </span>
              </li>
            </ul>
          </div>

          {/* Toolbar Buttons */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              5. Floating Toolbar
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The buttons in the top-right corner provide additional
              functionality:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Download:</strong> Save your customization as an image
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Orbit Controls:</strong> View and reset camera
                  controls
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Settings:</strong> Adjust background, environment, and
                  UI options
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>Help:</strong> Open this tutorial (you&apos;re here
                  now!)
                </span>
              </li>
            </ul>
          </div>

          {/* Tips */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">
              Tips & Tricks
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">💡</span>
                <span>
                  Experiment with different finish types to see how they affect
                  the appearance
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">💡</span>
                <span>
                  Use the clear paint option to create inner frame visibility
                  effects
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">💡</span>
                <span>
                  Try different environment presets in settings to see your
                  colors in various lighting
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">💡</span>
                <span>
                  Save your work by downloading an image before leaving the page
                </span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              This is an experimental feature. More mobile suits and sharing
              features coming soon!
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

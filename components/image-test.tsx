"use client";

import Image from "next/image";

export function ImageTest() {
  const testUrl = "https://static.wikia.nocookie.net/gundam/images/6/67/Sengoku_Astray_-_Front.png/revision/latest/scale-to-width-down/268?cb=20130925162851";

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Image Test</h3>
      <p className="text-sm text-muted-foreground mb-2">URL: {testUrl}</p>
      <div className="w-64 h-80 border relative">
        <Image
          src={testUrl}
          alt="Test image"
          fill
          className="object-cover"
          onLoad={() => console.log('Image loaded successfully')}
          onError={(e) => console.error('Image failed to load:', e)}
          sizes="256px"
        />
      </div>
    </div>
  );
}

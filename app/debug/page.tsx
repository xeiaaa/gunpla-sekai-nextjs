import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const debugTools = [
  {
    title: "Add Kits to Product Lines",
    description: "Debug tool for associating kits with their product lines",
    href: "/debug/add-kits-to-product-lines",
  },
  {
    title: "Add Kits to Mobile Suits",
    description:
      "Debug tool for creating many-to-many relationships between kits and mobile suits",
    href: "/debug/add-kits-to-ms",
  },
  {
    title: "Add Mobile Suits to Series",
    description: "Debug tool for associating mobile suits with their series",
    href: "/debug/add-ms-to-series",
  },
  {
    title: "Add Series to Timelines",
    description: "Debug tool for associating series with their timelines",
    href: "/debug/add-series-to-timelines",
  },
  {
    title: "Kit Accessories",
    description:
      "Debug tool for managing kit expansion relationships and accessories",
    href: "/debug/kit-accessories",
  },
  {
    title: "Timelines",
    description: "Debug tool for managing timeline data",
    href: "/debug/timelines",
  },
];

export default function DebugPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Debug Tools</h1>
        <p className="text-muted-foreground mt-2">
          Development and debugging utilities for the Gunpla Sekai application
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {debugTools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to access this debug tool
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

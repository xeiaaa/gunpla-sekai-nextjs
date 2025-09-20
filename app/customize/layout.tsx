import { Header } from "@/components/header";
import { ProgressBar } from "@/components/progress-bar";

export default function CustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProgressBar>
      <main className="flex-1">{children}</main>
    </ProgressBar>
  );
}

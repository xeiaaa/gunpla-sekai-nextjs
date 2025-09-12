# Installation

## Create project

Run the init command to create a new Next.js project or to setup an existing one:

**pnpm**

```bash
npx shadcn@latest init
```

**npm**

```bash
npx shadcn@latest init
```

**yarn**

```bash
npx shadcn@latest init
```

**bun**

```bash
npx shadcn@latest init
```

Choose between a Next.js project or a Monorepo.

## Add Components

You can now start adding components to your project.

**pnpm**

```bash
npx shadcn@latest add button
```

**npm**

```bash
npx shadcn@latest add button
```

**yarn**

```bash
npx shadcn@latest add button
```

**bun**

```bash
npx shadcn@latest add button
```

The command above will add the Button component to your project. You can then import it like this:

**app/page.tsx**

```tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}
```

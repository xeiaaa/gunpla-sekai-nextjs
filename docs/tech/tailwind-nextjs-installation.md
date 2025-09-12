# Installation

## Install Tailwind CSS with Next.js

Setting up Tailwind CSS in a Next.js project.

### 01

## Create your project

Start by creating a new Next.js project if you don't have one set up already. The most common approach is to use Create Next App.

**Terminal**

```bash
npx create-next-app@latest my-project --typescript --eslint --app
cd my-project
```

### 02

## Install Tailwind CSS

Install @tailwindcss/postcss and its peer dependencies via npm.

**Terminal**

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 03

## Configure PostCSS Plugins

Create a postcss.config.mjs file in the root of your project and add the @tailwindcss/postcss plugin to your PostCSS configuration.

**postcss.config.mjs**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### 04

## Import Tailwind CSS

Add an @import to ./app/globals.css that imports Tailwind CSS.

**globals.css**

```css
@import "tailwindcss";
```

### 05

## Start your build process

Run your build process with npm run dev.

**Terminal**

```bash
npm run dev
```

### 06

## Start using Tailwind in your project

Start using Tailwind's utility classes to style your content.

**page.tsx**

```tsx
export default function Home() {
  return <h1 className="text-3xl font-bold underline">Hello world!</h1>;
}
```

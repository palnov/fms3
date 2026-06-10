import fs from "fs";
import path from "path";

const mdxFiles = [
  "src/app/legal/check-ban/page.mdx",
  "src/app/pathways/citizenship/page.mdx",
  "src/app/pathways/citizenship/simplified/page.mdx",
  "src/app/pathways/repatriation/page.mdx",
  "src/app/pathways/rvp/marriage/page.mdx",
  "src/app/pathways/rvp/page.mdx",
  "src/app/pathways/rvp/quota/page.mdx",
  "src/app/pathways/vnzh/by-marriage/page.mdx",
  "src/app/pathways/vnzh/documents/page.mdx",
  "src/app/pathways/vnzh/page.mdx",
  "src/app/pathways/vnzh/without-rvp/page.mdx",
  "src/app/pathways/work/patent/page.mdx",
];

function run() {
  for (const relativePath of mdxFiles) {
    const fullPath = path.join(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found: ${relativePath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    
    // Regular expression to match: export const metadata = { ... }
    // Handles nested quotes and spans across multiple lines
    const metadataMatch = content.match(/export\s+const\s+metadata\s*=\s*({[\s\S]*?});?\r?\n/);
    if (!metadataMatch) {
      console.log(`No metadata found in: ${relativePath}`);
      continue;
    }

    const fullMatchText = metadataMatch[0];
    const metadataObjText = metadataMatch[1];

    // Check if title and description are present
    const titleMatch = metadataObjText.match(/title:\s*['"`](.*?)['"`]/);
    const descMatch = metadataObjText.match(/description:\s*['"`](.*?)['"`]/);

    const title = titleMatch ? titleMatch[1].replace(/'/g, "\\'") : "Миграция";
    const description = descMatch ? descMatch[1].replace(/'/g, "\\'") : "";

    // Sibling layout file path
    const dir = path.dirname(fullPath);
    const layoutPath = path.join(dir, "layout.tsx");

    // Construct layout content
    const layoutContent = `import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${title}',
  description: '${description}',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
`;

    // Write layout file
    fs.writeFileSync(layoutPath, layoutContent, "utf-8");
    console.log(`Created layout: ${path.relative(process.cwd(), layoutPath)}`);

    // Remove metadata block from MDX file
    const newMdxContent = content.replace(fullMatchText, "").trimStart();
    fs.writeFileSync(fullPath, newMdxContent, "utf-8");
    console.log(`Updated MDX (removed metadata): ${relativePath}`);
  }
}

run();

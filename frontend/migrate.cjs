const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix imports
  if (content.includes('@tanstack/react-router')) {
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["']@tanstack\/react-router["'];?/g, (match, imports) => {
      let parts = imports.split(',').map(s => s.trim());
      let newImports = [];
      if (parts.includes('Link')) newImports.push('Link');
      if (parts.includes('useNavigate')) newImports.push('useNavigate');
      if (parts.includes('useParams')) newImports.push('useParams');
      if (parts.includes('useRouterState')) newImports.push('useLocation');
      if (newImports.length > 0) {
        return `import { ${newImports.join(', ')} } from "react-router-dom";`;
      }
      return '';
    });
  }

  // 2. Fix useRouterState
  content = content.replace(/const\s+pathname\s*=\s*useRouterState\(\{\s*select:\s*\([^)]+\)\s*=>\s*[^.]+\.location\.pathname\s*\}\);/g, 'const { pathname } = useLocation();');

  // 3. Fix navigate
  // navigate({ to: "/candidates/$id", params: { id: c.id } }) => navigate(`/candidates/${c.id}`)
  content = content.replace(/navigate\(\{\s*to:\s*["']\/candidates\/\$id["'],\s*params:\s*\{\s*id:\s*([^}]+)\s*\}\s*\}\)/g, 'navigate(`/candidates/${$1}`)');
  content = content.replace(/navigate\(\{\s*to:\s*["']\/candidates\/\$id["'],\s*params:\s*\{\s*id\s*\}\s*\}\)/g, 'navigate(`/candidates/${id}`)');

  // 4. Fix Link
  // <Link to="/candidates/$id" params={{ id: c.id }}
  content = content.replace(/to=["']\/candidates\/\$id["']\s+params=\{\{\s*id:\s*([^}]+)\s*\}\}/g, 'to={`/candidates/${$1}`}');

  // 5. Remove createFileRoute
  content = content.replace(/export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\{\s*head:\s*\([^)]+\)\s*=>\s*\(\{[^}]+\}\),\s*component:\s*[a-zA-Z0-9_]+,\s*\}\);?/g, '');
  content = content.replace(/export\s+const\s+Route\s*=\s*createFileRoute\([^)]+\)\(\{\s*component:\s*[a-zA-Z0-9_]+,\s*\}\);?/g, '');

  // fallback for multi-line:
  let inRouteDef = false;
  let newLines = [];
  content.split('\n').forEach(line => {
    if (line.includes('export const Route = createFileRoute')) {
      inRouteDef = true;
    }
    if (!inRouteDef) {
      newLines.push(line);
    } else {
      if (line.trim() === '});') {
        inRouteDef = false;
      }
    }
  });
  content = newLines.join('\n');

  // 6. Default export for pages
  if (file.includes('pages\\') || file.includes('pages/')) {
    if (!content.includes('export default ')) {
      // Find the main functional component
      let match = content.match(/function\s+([A-Z][A-Za-z0-9_]*)/);
      if (match) {
        content += `\nexport default ${match[1]};\n`;
      }
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
  }
});

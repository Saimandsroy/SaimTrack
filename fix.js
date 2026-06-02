const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith(".tsx") || file.endsWith(".ts")) results.push(file);
    }
  });
  return results;
}

const files = walk("./src");
files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  
  // Revert any
  if (content.includes(": any = {")) {
    content = content.replace(/const staggerItem: any = \{/g, "const staggerItem = {");
    content = content.replace(/const staggerContainer: any = \{/g, "const staggerContainer = {");
    changed = true;
  }
  
  // Fix easing array TS issue
  if (content.includes("ease: [0.25, 0.1, 0.25, 1]")) {
    content = content.replace(/ease: \[0\.25, 0\.1, 0\.25, 1\](?! as \[)/g, "ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number]");
    changed = true;
  }

  // Fix unescaped entities
  if (file.includes("calendar-client.tsx")) {
    content = content.replace(/click "Add Session"/g, "click &quot;Add Session&quot;");
    changed = true;
  }
  if (file.includes("dsa-tracker-client.tsx")) {
    content = content.replace(/click "Log Problem"/g, "click &quot;Log Problem&quot;");
    changed = true;
  }
  if (file.includes("habit-tracker-client.tsx")) {
    content = content.replace(/You haven't built/g, "You haven&apos;t built");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
});
console.log("Fixes applied.");

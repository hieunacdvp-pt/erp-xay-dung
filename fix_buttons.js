const fs = require("fs");
const path = require("path");

const srcPages = "C:/Users/Admin/.gemini/antigravity/scratch/Construction_ERP/frontend/src/pages";
const files = fs.readdirSync(srcPages).filter(f => f.endsWith(".tsx"));
files.forEach(f => {
  const p = path.join(srcPages, f);
  let content = fs.readFileSync(p, "utf8");
  
  const target1 = "className=\"btn\" style={{ background: 'rgba(255,255,255,0.1)' }}";
  const replacement1 = "className=\"btn btn-primary\" style={{}}";
  
  const target2 = "className=\"btn\" style={{ background: 'rgba(255,255,255,0.1)', ";
  const replacement2 = "className=\"btn btn-primary\" style={{ ";
  
  if (content.includes(target1) || content.includes(target2)) {
    content = content.split(target1).join(replacement1);
    content = content.split(target2).join(replacement2);
    fs.writeFileSync(p, content);
    console.log("Fixed dim buttons in " + f);
  }
});

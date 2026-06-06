const fs = require("fs");
const path = require("path");

const srcPages = "C:/Users/Admin/.gemini/antigravity/scratch/Construction_ERP/frontend/src/pages";
const files = fs.readdirSync(srcPages).filter(f => f.endsWith(".tsx"));
files.forEach(f => {
  const p = path.join(srcPages, f);
  let content = fs.readFileSync(p, "utf8");
  const target = "<div style={{ display: 'none' }}>";
  const replacement = "<div style={{ overflow: 'hidden', height: 0, width: 0, position: 'absolute', top: '-9999px', left: '-9999px' }}>";
  if (content.includes(target)) {
    content = content.split(target).join(replacement);
    fs.writeFileSync(p, content);
    console.log("Fixed display:none in " + f);
  }
});

const srcTemplates = "C:/Users/Admin/.gemini/antigravity/scratch/Construction_ERP/frontend/src/components/print-templates";
const tfiles = fs.readdirSync(srcTemplates).filter(f => f.endsWith(".tsx"));
tfiles.forEach(f => {
  const p = path.join(srcTemplates, f);
  let content = fs.readFileSync(p, "utf8");
  const target1 = "if (!allocations || allocations.length === 0) return <div ref={ref} className=\"print-page-a4\"></div>;";
  const target2 = "if (!invoice) return <div ref={ref} className=\"print-page-a4\"></div>;";
  const target3 = "if (!movement) return <div ref={ref} className=\"print-page-a5\"></div>;";
  const target4 = "if (!transaction) return <div ref={ref} className=\"print-page-a5\"></div>;";
  
  if (content.includes(target1)) content = content.split(target1).join("if (!allocations) allocations = [];");
  if (content.includes(target2)) content = content.split(target2).join("if (!invoice) invoice = { id: 0, date: new Date() };");
  if (content.includes(target3)) content = content.split(target3).join("if (!movement) movement = { id: 0, date: new Date(), type: '' };");
  if (content.includes(target4)) content = content.split(target4).join("if (!transaction) transaction = { id: 0, date: new Date(), type: '' };");
  fs.writeFileSync(p, content);
  console.log("Fixed early returns in " + f);
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import css from "css";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODE = process.argv[2] === "selectors" ? "selectors" : "classes";

const BOOTSTRAP_CSS = path.join(
  __dirname,
  "node_modules",
  "bootstrap",
  "dist",
  "css",
  "bootstrap.css"
);

const OUT_JSON = path.join(__dirname, "bootstrap-map.json");

const isSimpleClassSelector = (sel) =>
  sel.startsWith(".") && !/[ \t>+~:#\[\(]/.test(sel);

const declsToCssText = (decls) =>
  decls
    .filter(d => d && d.type === "declaration")
    .map(d => `${d.property}: ${d.value};`)
    .join(" ");

function addRule(map, key, declarations, atContext = []) {
  const block = declsToCssText(declarations);
  if (!block) return;

  if (!map[key]) map[key] = [];

  if (atContext.length) {
    map[key].push({
      at: atContext,
      css: block
    });
  } else {
    map[key].push(block);
  }
}

function walkRules(rules, map, atContext = []) {
  for (const r of rules) {
    if (!r) continue;

    if (r.type === "rule" && Array.isArray(r.selectors)) {
      for (const sel of r.selectors) {
        if (!sel || !sel.startsWith(".")) continue;

        if (MODE === "classes") {
          if (isSimpleClassSelector(sel)) {
            addRule(map, sel, r.declarations, atContext);
          }
        } else {
          addRule(map, sel, r.declarations, atContext);
        }
      }
    } else if (r.type === "media") {
      walkRules(r.rules, map, [...atContext, `@media ${r.media}`]);
    } else if (r.type === "supports") {
      walkRules(r.rules, map, [...atContext, `@supports ${r.supports}`]);
    } else if (r.type === "document") {
      walkRules(r.rules, map, [...atContext, `@document ${r.document}`]);
    } else if (r.type === "keyframes") {
    }
  }
}

function main() {
  const cssText = fs.readFileSync(BOOTSTRAP_CSS, "utf8");
  const ast = css.parse(cssText);
  const map = {};
  walkRules(ast.stylesheet.rules, map, []);

  const normalized = Object.fromEntries(
    Object.entries(map).map(([k, v]) => {
      if (Array.isArray(v) && v.length === 1) return [k, v[0]];
      return [k, v];
    })
  );

  fs.writeFileSync(OUT_JSON, JSON.stringify(normalized, null, 2), "utf8");
  console.log(`✅ Wrote ${OUT_JSON} in mode: ${MODE}`);
}

main();

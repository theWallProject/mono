import fs from "fs";
import path from "path";
import prettier from "prettier";
import { log } from "../../helper";
import type {
  ManualOverrideValue,
  ManualOverrideFields,
} from "./types";
import { isProcessed } from "./types";

const manualOverridesPath = path.join(
  __dirname,
  "../manual_resolve/manualOverrides.ts",
);

const formatValue = (value: ManualOverrideValue): string => {
  if (isProcessed(value)) {
    const fields: string[] = [];
    if ("ws" in value && value.ws !== undefined)
      fields.push(`ws: ${JSON.stringify(value.ws)}`);
    if ("li" in value && value.li !== undefined)
      fields.push(`li: ${JSON.stringify(value.li)}`);
    if ("fb" in value && value.fb !== undefined)
      fields.push(`fb: ${JSON.stringify(value.fb)}`);
    if ("tw" in value && value.tw !== undefined)
      fields.push(`tw: ${JSON.stringify(value.tw)}`);
    if ("ig" in value && value.ig !== undefined)
      fields.push(`ig: ${JSON.stringify(value.ig)}`);
    if ("gh" in value && value.gh !== undefined)
      fields.push(`gh: ${JSON.stringify(value.gh)}`);
    if ("ytp" in value && value.ytp !== undefined)
      fields.push(`ytp: ${JSON.stringify(value.ytp)}`);
    if ("ytc" in value && value.ytc !== undefined)
      fields.push(`ytc: ${JSON.stringify(value.ytc)}`);
    if ("tt" in value && value.tt !== undefined)
      fields.push(`tt: ${JSON.stringify(value.tt)}`);
    if ("th" in value && value.th !== undefined)
      fields.push(`th: ${JSON.stringify(value.th)}`);
    if ("urls" in value && value.urls !== undefined)
      fields.push(`urls: ${JSON.stringify(value.urls)}`);

    if (fields.length > 0) {
      // Has changes - include both the fields and the processed state
      return `{ ${fields.join(", ")}, _processed: true }`;
    } else {
      // No changes - just processed state
      return `{ _processed: true }`;
    }
  } else {
    // Regular override without processed state
    const fields: string[] = [];
    if (value.ws !== undefined) fields.push(`ws: ${JSON.stringify(value.ws)}`);
    if (value.li !== undefined) fields.push(`li: ${JSON.stringify(value.li)}`);
    if (value.fb !== undefined) fields.push(`fb: ${JSON.stringify(value.fb)}`);
    if (value.tw !== undefined) fields.push(`tw: ${JSON.stringify(value.tw)}`);
    if (value.ig !== undefined) fields.push(`ig: ${JSON.stringify(value.ig)}`);
    if (value.gh !== undefined) fields.push(`gh: ${JSON.stringify(value.gh)}`);
    if (value.ytp !== undefined)
      fields.push(`ytp: ${JSON.stringify(value.ytp)}`);
    if (value.ytc !== undefined)
      fields.push(`ytc: ${JSON.stringify(value.ytc)}`);
    if (value.tt !== undefined) fields.push(`tt: ${JSON.stringify(value.tt)}`);
    if (value.th !== undefined) fields.push(`th: ${JSON.stringify(value.th)}`);
    if ("urls" in value && value.urls !== undefined)
      fields.push(`urls: ${JSON.stringify(value.urls)}`);

    if (fields.length > 0) {
      return `{ ${fields.join(", ")} }`;
    } else {
      return `{}`;
    }
  }
};

export const loadManualOverrides = (): Record<string, ManualOverrideValue> => {
  const modulePath = path.resolve(manualOverridesPath);
  const resolvedPath = require.resolve(modulePath);
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete require.cache[resolvedPath];
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const module = require(modulePath);
  const overrides = (module.manualOverrides || {}) satisfies Record<
    string,
    ManualOverrideValue
  >;
  return overrides;
};

export const saveManualOverrides = async (
  overrides: Record<string, ManualOverrideValue>,
): Promise<void> => {
  const keys = Object.keys(overrides).sort();
  let content = 'import { ScrappedItemType } from "../../types";\n\n';
  content +=
    '// Allow arrays for link fields in overrides\ntype ManualOverrideFields = {\n  ws?: string | string[];\n  li?: string | string[];\n  fb?: string | string[];\n  tw?: string | string[];\n  ig?: string | string[];\n  gh?: string | string[];\n  ytp?: string | string[];\n  ytc?: string | string[];\n  tt?: string | string[];\n  th?: string | string[];\n} & Omit<Partial<ScrappedItemType>, "ws" | "li" | "fb" | "tw" | "ig" | "gh" | "ytp" | "ytc" | "tt" | "th">;\n\n';
  content +=
    "export const manualOverrides: Record<string, ManualOverrideFields | { _processed: true } | (ManualOverrideFields & { _processed: true }) | (ManualOverrideFields & { urls?: string[] }) | (ManualOverrideFields & { _processed: true; urls?: string[] })> = {\n";

  for (const key of keys) {
    const value = overrides[key];
    const needsQuotes = !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
    const keyStr = needsQuotes ? `"${key.replace(/"/g, '\\"')}"` : key;
    content += `  ${keyStr}: ${formatValue(value)},\n`;
  }

  content += "};\n";

  // Format with prettier
  try {
    const prettierConfig = await prettier.resolveConfig(manualOverridesPath);
    const formatted = await prettier.format(content, {
      ...prettierConfig,
      parser: "typescript",
    });
    fs.writeFileSync(manualOverridesPath, formatted, "utf-8");
    log(
      `Saved manualOverrides to ${manualOverridesPath} (formatted with prettier)`,
    );
  } catch (e) {
    // If prettier fails, save without formatting
    fs.writeFileSync(manualOverridesPath, content, "utf-8");
    log(
      `Saved manualOverrides to ${manualOverridesPath} (prettier failed: ${e})`,
    );
  }
};


#!/usr/bin/env node

/**
 * OpenAPI YAML to JSON Converter
 * Converts the OpenAPI YAML spec to JSON format for better tool compatibility
 */

const fs = require('fs');
const path = require('path');

// Simple YAML parser (handles basic YAML structure)
function parseYAML(yamlContent) {
  const lines = yamlContent.split('\n');
  const result = {};
  const stack = [{ obj: result, indent: -1 }];
  let currentKey = null;
  let multilineValue = null;
  let multilineIndent = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const indent = line.search(/\S/);

    // Handle multiline strings
    if (multilineValue !== null) {
      if (indent > multilineIndent) {
        multilineValue.push(line.substring(multilineIndent + 2));
        continue;
      } else {
        // End of multiline
        const parent = stack[stack.length - 1].obj;
        parent[currentKey] = multilineValue.join('\n');
        multilineValue = null;
        multilineIndent = -1;
      }
    }

    // Adjust stack based on indentation
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].obj;

    // Handle key-value pairs
    if (line.includes(':')) {
      const colonIndex = line.indexOf(':');
      const key = line.substring(indent, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      currentKey = key;

      // Check for multiline indicators
      if (value === '|' || value === '>') {
        multilineValue = [];
        multilineIndent = indent;
        continue;
      }

      // Handle different value types
      if (!value) {
        // Object or array coming next
        const newObj = {};
        parent[key] = newObj;
        stack.push({ obj: newObj, indent });
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        parent[key] = JSON.parse(value.replace(/'/g, '"'));
      } else if (value.startsWith('{') && value.endsWith('}')) {
        // Inline object
        parent[key] = JSON.parse(value.replace(/'/g, '"'));
      } else if (value === 'true' || value === 'false') {
        parent[key] = value === 'true';
      } else if (!isNaN(value) && value !== '') {
        parent[key] = Number(value);
      } else if (value.startsWith('"') || value.startsWith("'")) {
        parent[key] = value.slice(1, -1);
      } else {
        parent[key] = value;
      }
    } else if (line.trim().startsWith('-')) {
      // Array item
      const value = line.substring(line.indexOf('-') + 1).trim();

      if (!Array.isArray(parent)) {
        // Convert parent to array if needed
        const keys = Object.keys(parent);
        if (keys.length === 0) {
          Object.setPrototypeOf(parent, Array.prototype);
          parent.length = 0;
        }
      }

      if (Array.isArray(parent)) {
        if (value.includes(':')) {
          const newObj = {};
          parent.push(newObj);
          const colonIndex = value.indexOf(':');
          const key = value.substring(0, colonIndex).trim();
          const val = value.substring(colonIndex + 1).trim();
          newObj[key] = val || {};
          if (!val) {
            stack.push({ obj: newObj[key], indent });
          }
        } else {
          parent.push(value);
        }
      }
    }
  }

  return result;
}

// Better approach: Use require for js-yaml if available, otherwise use fetch
async function convertYAMLtoJSON() {
  const yamlPath = path.join(__dirname, '../docs/api/swagger/openapi.yaml');
  const jsonPath = path.join(__dirname, '../docs/api/swagger/openapi.json');

  console.log('Converting OpenAPI YAML to JSON...');
  console.log(`Input: ${yamlPath}`);
  console.log(`Output: ${jsonPath}`);

  try {
    // Try to use js-yaml if available
    let yaml;
    try {
      yaml = require('js-yaml');
      console.log('Using js-yaml parser');
    } catch (e) {
      console.log('js-yaml not found, using basic parser');
    }

    const yamlContent = fs.readFileSync(yamlPath, 'utf8');

    let jsonData;
    if (yaml) {
      jsonData = yaml.load(yamlContent);
    } else {
      console.warn('Warning: Using basic YAML parser. For best results, install js-yaml: npm install -D js-yaml');
      jsonData = parseYAML(yamlContent);
    }

    const jsonString = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(jsonPath, jsonString, 'utf8');

    console.log('✅ Conversion successful!');
    console.log(`Generated: ${jsonPath}`);
    console.log(`Size: ${(jsonString.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  convertYAMLtoJSON().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { convertYAMLtoJSON };

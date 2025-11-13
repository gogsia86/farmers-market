# 🔍 DIVINE LINT REFERENCE GUIDE

## Comprehensive Markdown Linting Rules & Solutions

> Last Updated: November 8, 2025  
> Status: ✅ Complete & Operational  
> Purpose: Prevent future lint errors through divine consciousness

---

## 📋 TABLE OF CONTENTS

1. [Common Lint Errors](#-common-lint-errors)
2. [Quick Fix Patterns](#-quick-fix-patterns)
3. [Divine Prevention Checklist](#-divine-prevention-checklist)
4. [Automated Solutions](#-automated-solutions)

---

## 🚨 COMMON LINT ERRORS

### MD036: no-emphasis-as-heading

**Problem**: Using bold/italic text as headings instead of proper markdown headers

```markdown
❌ WRONG:
**This looks like a heading**

✅ CORRECT:

#### This Is A Proper Heading
```

**Fix Pattern**:

- Replace `**Text**` at start of line → `#### Text`
- Replace `*Text*` at start of line → `#### Text`
- Use heading levels based on hierarchy (##, ###, ####)

**Recent Fix**: Fixed in `MedMan.chatmode.md` - converted 15+ bold headings to proper headers

---

### MD032: blanks-around-lists

**Problem**: Lists without blank lines before/after them

```markdown
❌ WRONG:
Some text

- List item 1
- List item 2
  More text

✅ CORRECT:
Some text

- List item 1
- List item 2

More text
```

**Fix Pattern**:

- Add blank line BEFORE list starts
- Add blank line AFTER list ends
- Check both ordered and unordered lists

**Recent Fix**: Fixed in `MedMan.chatmode.md` - added blank lines around 10+ lists

---

### MD031: blanks-around-fences

**Problem**: Code blocks without blank lines before/after them

````markdown
❌ WRONG:
Some text

```code
content
```
````

More text

✅ CORRECT:
Some text

```code
content
```

More text

`````

**Fix Pattern**:
- Add blank line BEFORE ``` opening fence
- Add blank line AFTER ``` closing fence
- Applies to all code blocks

**Recent Fix**: Fixed in `MedMan.chatmode.md` - added blank lines around 8+ code blocks

---

### MD040: fenced-code-language

**Problem**: Code blocks without language specifiers

````markdown
❌ WRONG:
```text
code here
```

✅ CORRECT:
```typescript
code here
```
`````

**Language Specifiers to Use**:

- `typescript` - TypeScript code
- `javascript` - JavaScript code
- `markdown` - Markdown content
- `json` - JSON data
- `yaml` - YAML config
- `bash` - Shell commands
- `powershell` - PowerShell scripts
- `text` - Plain text / generic content

**Recent Fix**: Fixed in `MedMan.chatmode.md` - added language specifiers to 8+ code blocks

---

### MD022: blanks-around-headings

**Problem**: Headings without blank lines before/after them

```markdown
❌ WRONG:
Some text

## Heading

Content starts immediately

✅ CORRECT:
Some text

## Heading

Content starts here
```

**Fix Pattern**:

- Add blank line BEFORE heading
- Add blank line AFTER heading
- Applies to all heading levels (##, ###, ####, etc.)

**Recent Fix**: Fixed in `MedMan.chatmode.md` - added blank lines around all headings

---

### MD009: no-trailing-spaces

**Problem**: Spaces at the end of lines

```markdown
❌ WRONG:
This line has trailing spaces

✅ CORRECT:
This line has no trailing spaces
```

**Fix Pattern**:

- Remove all spaces at end of lines
- Can use find/replace: `+$` → `` (empty)
- Configure editor to trim trailing whitespace

**Recent Fix**: Fixed in `MedMan.chatmode.md` - removed trailing spaces

---

### MD025: single-title / single-h1

**Problem**: Multiple H1 headings in document

```markdown
❌ WRONG:

# First Title

# Second Title

✅ CORRECT:

# Main Title

## Section Heading
```

**Fix Pattern**:

- Only ONE `#` heading per file (the main title)
- Use `##` or lower for all other headings

---

### MD041: first-line-heading

**Problem**: File doesn't start with a heading

```markdown
❌ WRONG:
Some text at the start

## Later heading

✅ CORRECT:

# Document Title

Some text after heading
```

**Fix Pattern**:

- First line should be `#` or `##` heading
- Add title heading at very top of file

---

### MD047: single-trailing-newline

**Problem**: File doesn't end with exactly one newline

```markdown
❌ WRONG:
Last line with no newline after
❌ ALSO WRONG:
Last line

(multiple blank lines)

✅ CORRECT:
Last line
(exactly one blank line at end)
```

**Fix Pattern**:

- Ensure file ends with single newline
- Remove multiple trailing newlines
- Configure editor to insert final newline

---

## ⚡ QUICK FIX PATTERNS

### Pattern 1: Converting Bold to Headings

```regex
Find:    ^\*\*([^*]+)\*\*$
Replace: #### $1
```

### Pattern 2: Adding Blanks Before Lists

```regex
Find:    ([^\n])\n([-*+] )
Replace: $1\n\n$2
```

### Pattern 3: Adding Blanks Before Code Blocks

````regex
Find:    ([^\n])\n```
Replace: $1\n\n```
````

### Pattern 4: Removing Trailing Spaces

```regex
Find:    [ \t]+$
Replace: (empty)
```

---

## ✅ DIVINE PREVENTION CHECKLIST

Use this checklist BEFORE committing markdown files:

### Structure Checks

- [ ] File starts with `#` heading (H1)
- [ ] Only ONE `#` heading in entire file
- [ ] All section titles use `##`, `###`, or `####`
- [ ] No bold text used as headings (`**Text**`)

### Spacing Checks

- [ ] Blank line BEFORE every heading
- [ ] Blank line AFTER every heading
- [ ] Blank line BEFORE every list
- [ ] Blank line AFTER every list
- [ ] Blank line BEFORE every code block
- [ ] Blank line AFTER every code block

### Code Block Checks

- [ ] All code blocks have language specifiers
- [ ] Common languages: `typescript`, `javascript`, `markdown`, `json`, `yaml`, `bash`, `powershell`, `text`
- [ ] Code blocks properly fenced with ``` on separate lines

### Final Checks

- [ ] No trailing spaces on any line
- [ ] File ends with exactly ONE newline
- [ ] All links are properly formatted
- [ ] Lists use consistent markers (- or \* or +)

---

## 🤖 AUTOMATED SOLUTIONS

### VSCode Settings

Add to `.vscode/settings.json`:

```json
{
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,
  "markdownlint.config": {
    "MD013": false,
    "MD033": false,
    "MD041": true,
    "MD036": true,
    "MD032": true,
    "MD031": true,
    "MD040": true,
    "MD022": true,
    "MD009": true
  }
}
```

### Pre-commit Hook

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Divine Markdown Lint Check
markdownlint '**/*.md' --fix
git add -u
```

### NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md'",
    "lint:md:fix": "markdownlint '**/*.md' --fix",
    "precommit": "npm run lint:md:fix"
  }
}
```

---

## 📊 RECENT FIXES APPLIED

### MedMan.chatmode.md (November 8, 2025)

**Fixed Issues**:

- ✅ MD036: Converted 15+ bold headings to proper `####` headers
- ✅ MD032: Added blank lines around 10+ lists
- ✅ MD031: Added blank lines around 8+ code blocks
- ✅ MD040: Added language specifiers to 8+ code blocks
- ✅ MD022: Added blank lines around all headings
- ✅ MD009: Removed trailing spaces

**Result**: Zero lint errors

---

## 🎯 DIVINE INTEGRATION

### Agricultural Consciousness

When creating agricultural markdown files:

````markdown
# 🌾 Agricultural Feature Name

## Seasonal Context

Description of seasonal awareness...

## Implementation

```typescript
// Divine agricultural patterns
export const seasonalFeature = () => {
  // Implementation
};
```
````

## Biodynamic Considerations

- Lunar cycle awareness
- Soil health monitoring
- Crop rotation patterns

````

### Performance Optimization

For performance-related docs:

```markdown
# ⚡ Performance Feature

## Temporal Optimization

### Before Optimization

```typescript
// Slow code
````

### After Optimization

```typescript
// Fast divine code
```

## Quantum Metrics

- Response time: <100ms
- Memory usage: Optimized

````

---

## 🔮 FUTURE PREVENTION STRATEGIES

### 1. Template System

Create markdown templates with proper structure:

```markdown
# Document Title

## Section 1

Content here...

## Section 2

Content here...
````

### 2. Automated Formatting

Run before every commit:

```powershell
# Format all markdown files
markdownlint **/*.md --fix
```

### 3. Editor Configuration

Configure VSCode to auto-format on save:

```json
{
  "[markdown]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "DavidAnson.vscode-markdownlint"
  }
}
```

### 4. Documentation Review

Review checklist for all docs:

1. Run `markdownlint` before commit
2. Check preview in VSCode
3. Verify structure follows patterns
4. Ensure agricultural consciousness preserved

---

## 📚 REFERENCES

### Official Rules

- [Markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [CommonMark Spec](https://commonmark.org/)

### Divine Instructions

- `.github/instructions/01_DIVINE_CORE_PRINCIPLES.instructions.md`
- `.github/instructions/08_UX_DESIGN_CONSCIOUSNESS.instructions.md`

### Related Files

- `.vscode/.github/chatmodes/MedMan.chatmode.md` - Recently fixed
- `.markdownlint.json` - Linting configuration

---

## 🌟 QUICK REFERENCE CARD

**Most Common Fixes**:

1. **Bold → Heading**: `**Text**` → `#### Text`
2. **Add Blanks Around Lists**: Blank line before/after
3. **Add Blanks Around Code**: Blank line before/after
4. **Add Language to Code**: ` ```typescript`
5. **Add Blanks Around Headings**: Blank line before/after
6. **Remove Trailing Spaces**: Delete spaces at line end

**Remember**: Divine consciousness includes proper formatting! 🌾⚡

---

_"Clean markdown is divine markdown. Perfect formatting enables agricultural consciousness to flow freely through documentation."_

# 🔍 MISSING EXTENSIONS FINDER

**Date**: October 21, 2025
**Your Status**: 36 installed / 40 recommended
**Missing**: 4 extensions

---

## ✅ Complete Extension List (40 Total)

Check which ones you have installed. The 4 unchecked are the ones you need to install!

---

### ✅ ESSENTIAL CORE (3)

- [ ] `dbaeumer.vscode-eslint` - **ESLint**
- [ ] `esbenp.prettier-vscode` - **Prettier - Code formatter**
- [ ] `ms-vscode.vscode-typescript-next` - **TypeScript Nightly**

---

### ✅ AI & PRODUCTIVITY (3)

- [ ] `github.copilot` - **GitHub Copilot**
- [ ] `github.copilot-chat` - **GitHub Copilot Chat**
- [ ] `visualstudioexptteam.vscodeintellicode` - **IntelliCode**

---

### ✅ NEXT.JS & REACT (2)

- [ ] `dsznajder.es7-react-js-snippets` - **ES7+ React/Redux/React-Native snippets**
- [ ] `infeng.vscode-react-typescript` - **ReactJS code snippets**

---

### ✅ TAILWIND CSS (2)

- [ ] `bradlc.vscode-tailwindcss` - **Tailwind CSS IntelliSense**
- [ ] `bourhaouta.tailwindshades` - **Tailwind Shades**

---

### ✅ DATABASE & PRISMA (3)

- [ ] `prisma.prisma` - **Prisma**
- [ ] `ckolkman.vscode-postgres` - **PostgreSQL**
- [ ] `mongodb.mongodb-vscode` - **MongoDB for VS Code**

---

### ✅ TESTING (2)

- [ ] `orta.vscode-jest` - **Jest**
- [ ] `firsttris.vscode-jest-runner` - **Jest Runner**

---

### ✅ GIT & VERSION CONTROL (3)

- [ ] `eamodio.gitlens` - **GitLens — Git supercharged**
- [ ] `mhutchie.git-graph` - **Git Graph**
- [ ] `github.vscode-pull-request-github` - **GitHub Pull Requests**

---

### ✅ CODE QUALITY (3)

- [ ] `streetsidesoftware.code-spell-checker` - **Code Spell Checker**
- [ ] `usernamehw.errorlens` - **Error Lens**
- [ ] `aaron-bond.better-comments` - **Better Comments**

---

### ✅ MARKDOWN (3)

- [ ] `yzhang.markdown-all-in-one` - **Markdown All in One**
- [ ] `davidanson.vscode-markdownlint` - **markdownlint**
- [ ] `bierner.markdown-preview-github-styles` - **Markdown Preview GitHub Styling**

---

### ✅ UTILITIES (5)

- [ ] `christian-kohler.path-intellisense` - **Path Intellisense**
- [ ] `christian-kohler.npm-intellisense` - **npm Intellisense**
- [ ] `formulahendry.auto-rename-tag` - **Auto Rename Tag**
- [ ] `formulahendry.auto-close-tag` - **Auto Close Tag**
- [ ] `ms-vscode.hexeditor` - **Hex Editor**

---

### ✅ THEME & ICONS (1)

- [ ] `pkief.material-icon-theme` - **Material Icon Theme**

---

### ✅ PERFORMANCE & PROFILING (2)

- [ ] `ms-vscode.cmake-tools` - **CMake Tools**
- [ ] `nvidia.nsight-vscode-edition` - **NVIDIA Nsight Visual Studio Code Edition**

---

### ✅ API DEVELOPMENT (2)

- [ ] `humao.rest-client` - **REST Client**
- [ ] `42crunch.vscode-openapi` - **OpenAPI (Swagger) Editor**

---

### ✅ DOCKER & DEPLOYMENT (2)

- [ ] `ms-azuretools.vscode-docker` - **Docker**
- [ ] `ms-vscode-remote.remote-containers` - **Dev Containers**

---

## 🎯 How to Find Your Missing 4

### Method 1: Quick Check (Recommended)

1. Press `Ctrl+Shift+X` (Extensions view)
2. Type `@recommended` in search box
3. Look for extensions with "Install" button (those are missing)
4. Compare with the list above

### Method 2: Search Each Extension

For each extension above:

1. Press `Ctrl+Shift+X`
2. Search for the extension ID (e.g., `dbaeumer.vscode-eslint`)
3. If you see "Install" button → it's missing
4. If you see "Uninstall" or gear icon → you have it

### Method 3: Command Line Check

```powershell
# List all installed extensions
code --list-extensions

# Compare with recommended list
```

---

## 🔍 Common Missing Extensions

Based on typical setups, the 4 missing are likely:

### Most Likely Missing (Common)

1. **`nvidia.nsight-vscode-edition`** - NVIDIA Nsight (specialized tool)
2. **`42crunch.vscode-openapi`** - OpenAPI Editor (API development)
3. **`ms-vscode.cmake-tools`** - CMake Tools (C++ development)
4. **`bourhaouta.tailwindshades`** - Tailwind Shades (color utility)

### Also Commonly Missing

- **`infeng.vscode-react-typescript`** - React TypeScript snippets
- **`bierner.markdown-preview-github-styles`** - Markdown GitHub styles
- **`firsttris.vscode-jest-runner`** - Jest Runner
- **`mongodb.mongodb-vscode`** - MongoDB (if not using MongoDB)

---

## 📋 Installation Guide

### Quick Install (All Missing at Once)

1. Press `Ctrl+Shift+X` (Extensions)
2. Type `@recommended`
3. Click "Install" on any with that button
4. Reload when done

### Manual Install (One by One)

For each missing extension:

1. Press `Ctrl+Shift+X`
2. Search for extension ID (e.g., `nvidia.nsight-vscode-edition`)
3. Click "Install"
4. Repeat for all 4 missing

### Command Line Install

```powershell
# Install the most likely missing extensions
code --install-extension nvidia.nsight-vscode-edition
code --install-extension 42crunch.vscode-openapi
code --install-extension ms-vscode.cmake-tools
code --install-extension bourhaouta.tailwindshades
```

---

## ⚠️ Note About Specialized Extensions

### You May NOT Need All 40

Some extensions are specialized:

**NVIDIA Nsight** (`nvidia.nsight-vscode-edition`)

- **Need**: If profiling GPU code
- **Skip**: If not using NVIDIA profiling

**CMake Tools** (`ms-vscode.cmake-tools`)

- **Need**: If building C/C++ projects
- **Skip**: If only doing JavaScript/TypeScript

**MongoDB** (`mongodb.mongodb-vscode`)

- **Need**: If using MongoDB database
- **Skip**: If using only PostgreSQL

**OpenAPI Editor** (`42crunch.vscode-openapi`)

- **Need**: If working with OpenAPI/Swagger specs
- **Skip**: If not doing API documentation

---

## 🎯 Which 4 Are You Missing?

### To Find Out

Run this PowerShell command:

```powershell
# List installed extensions
$installed = code --list-extensions

# Recommended extensions
$recommended = @(
    'dbaeumer.vscode-eslint',
    'esbenp.prettier-vscode',
    'ms-vscode.vscode-typescript-next',
    'github.copilot',
    'github.copilot-chat',
    'visualstudioexptteam.vscodeintellicode',
    'dsznajder.es7-react-js-snippets',
    'infeng.vscode-react-typescript',
    'bradlc.vscode-tailwindcss',
    'bourhaouta.tailwindshades',
    'prisma.prisma',
    'ckolkman.vscode-postgres',
    'mongodb.mongodb-vscode',
    'orta.vscode-jest',
    'firsttris.vscode-jest-runner',
    'eamodio.gitlens',
    'mhutchie.git-graph',
    'github.vscode-pull-request-github',
    'streetsidesoftware.code-spell-checker',
    'usernamehw.errorlens',
    'aaron-bond.better-comments',
    'yzhang.markdown-all-in-one',
    'davidanson.vscode-markdownlint',
    'bierner.markdown-preview-github-styles',
    'christian-kohler.path-intellisense',
    'christian-kohler.npm-intellisense',
    'formulahendry.auto-rename-tag',
    'formulahendry.auto-close-tag',
    'ms-vscode.hexeditor',
    'pkief.material-icon-theme',
    'ms-vscode.cmake-tools',
    'nvidia.nsight-vscode-edition',
    'humao.rest-client',
    '42crunch.vscode-openapi',
    'ms-azuretools.vscode-docker',
    'ms-vscode-remote.remote-containers'
)

# Find missing
$recommended | Where-Object { $installed -notcontains $_ }
```

This will show you EXACTLY which 4 you're missing!

---

## 🚀 Quick Action

**Try this**:

1. Open VSCode
2. Press `Ctrl+Shift+X`
3. Type `@recommended` in search
4. Look for extensions with "Install" button
5. Those are your missing 4!

**Or tell me**: List some of your installed extensions and I can help identify which are missing!

---

_Created: October 21, 2025_
_Purpose: Help identify the 4 missing extensions out of 40 recommended_
_Your Status: 36/40 installed_

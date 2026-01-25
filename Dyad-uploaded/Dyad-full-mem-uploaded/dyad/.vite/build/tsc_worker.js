"use strict";
const fs = require("node:fs");
const path = require("node:path");
const node_worker_threads = require("node:worker_threads");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
function normalizePath$1(path2) {
  return path2.replace(/\\/g, "/");
}
class BaseVirtualFileSystem {
  virtualFiles = /* @__PURE__ */ new Map();
  deletedFiles = /* @__PURE__ */ new Set();
  baseDir;
  constructor(baseDir) {
    this.baseDir = path__namespace.resolve(baseDir);
  }
  /**
   * Normalize path for consistent cross-platform behavior
   */
  normalizePathForKey(filePath) {
    const absolutePath = path__namespace.isAbsolute(filePath) ? filePath : path__namespace.resolve(this.baseDir, filePath);
    const normalized = normalizePath$1(path__namespace.normalize(absolutePath));
    return normalized;
  }
  /**
   * Convert normalized path back to platform-appropriate format
   */
  denormalizePath(normalizedPath) {
    return process.platform === "win32" ? normalizedPath.replace(/\//g, "\\") : normalizedPath;
  }
  /**
   * Apply changes from a response containing dyad tags
   */
  applyResponseChanges({
    deletePaths,
    renameTags,
    writeTags
  }) {
    for (const deletePath of deletePaths) {
      this.deleteFile(deletePath);
    }
    for (const rename of renameTags) {
      this.renameFile(rename.from, rename.to);
    }
    for (const writeTag of writeTags) {
      this.writeFile(writeTag.path, writeTag.content);
    }
  }
  /**
   * Write a file to the virtual filesystem
   */
  writeFile(relativePath, content) {
    const absolutePath = path__namespace.resolve(this.baseDir, relativePath);
    const normalizedKey = this.normalizePathForKey(absolutePath);
    this.virtualFiles.set(normalizedKey, content);
    this.deletedFiles.delete(normalizedKey);
  }
  /**
   * Delete a file from the virtual filesystem
   */
  deleteFile(relativePath) {
    const absolutePath = path__namespace.resolve(this.baseDir, relativePath);
    const normalizedKey = this.normalizePathForKey(absolutePath);
    this.deletedFiles.add(normalizedKey);
    this.virtualFiles.delete(normalizedKey);
  }
  /**
   * Rename a file in the virtual filesystem
   */
  renameFile(fromPath, toPath) {
    const fromAbsolute = path__namespace.resolve(this.baseDir, fromPath);
    const toAbsolute = path__namespace.resolve(this.baseDir, toPath);
    const fromNormalized = this.normalizePathForKey(fromAbsolute);
    const toNormalized = this.normalizePathForKey(toAbsolute);
    this.deletedFiles.add(fromNormalized);
    if (this.virtualFiles.has(fromNormalized)) {
      const content = this.virtualFiles.get(fromNormalized);
      this.virtualFiles.delete(fromNormalized);
      this.virtualFiles.set(toNormalized, content);
    } else {
      try {
        const content = fs__namespace.readFileSync(fromAbsolute, "utf8");
        this.virtualFiles.set(toNormalized, content);
      } catch (error) {
        console.warn(
          `Could not read source file for rename: ${fromPath}`,
          error
        );
      }
    }
    this.deletedFiles.delete(toNormalized);
  }
  /**
   * Get all virtual files (files that have been written or modified)
   */
  getVirtualFiles() {
    return Array.from(this.virtualFiles.entries()).map(
      ([normalizedKey, content]) => {
        const denormalizedPath = this.denormalizePath(normalizedKey);
        return {
          path: path__namespace.relative(this.baseDir, denormalizedPath),
          content
        };
      }
    );
  }
  /**
   * Get all deleted file paths (relative to base directory)
   */
  getDeletedFiles() {
    return Array.from(this.deletedFiles).map((normalizedKey) => {
      const denormalizedPath = this.denormalizePath(normalizedKey);
      return path__namespace.relative(this.baseDir, denormalizedPath);
    });
  }
  /**
   * Check if a file is deleted in the virtual filesystem
   */
  isDeleted(filePath) {
    const normalizedKey = this.normalizePathForKey(filePath);
    return this.deletedFiles.has(normalizedKey);
  }
  /**
   * Check if a file exists in virtual files
   */
  hasVirtualFile(filePath) {
    const normalizedKey = this.normalizePathForKey(filePath);
    return this.virtualFiles.has(normalizedKey);
  }
  /**
   * Get virtual file content
   */
  getVirtualFileContent(filePath) {
    const normalizedKey = this.normalizePathForKey(filePath);
    return this.virtualFiles.get(normalizedKey);
  }
}
class SyncVirtualFileSystemImpl extends BaseVirtualFileSystem {
  delegate;
  constructor(baseDir, delegate) {
    super(baseDir);
    this.delegate = delegate || {};
  }
  /**
   * Check if a file exists in the virtual filesystem
   */
  fileExists(filePath) {
    if (this.isDeleted(filePath)) {
      return false;
    }
    if (this.hasVirtualFile(filePath)) {
      return true;
    }
    if (this.delegate.fileExists) {
      return this.delegate.fileExists(filePath);
    }
    const absolutePath = path__namespace.isAbsolute(filePath) ? filePath : path__namespace.resolve(this.baseDir, filePath);
    return fs__namespace.existsSync(absolutePath);
  }
  /**
   * Read a file from the virtual filesystem
   */
  readFile(filePath) {
    if (this.isDeleted(filePath)) {
      return void 0;
    }
    const virtualContent = this.getVirtualFileContent(filePath);
    if (virtualContent !== void 0) {
      return virtualContent;
    }
    if (this.delegate.readFile) {
      return this.delegate.readFile(filePath);
    }
    try {
      const absolutePath = path__namespace.isAbsolute(filePath) ? filePath : path__namespace.resolve(this.baseDir, filePath);
      return fs__namespace.readFileSync(absolutePath, "utf8");
    } catch {
      return void 0;
    }
  }
  /**
   * Create a custom file system interface for other tools
   */
  createFileSystemInterface() {
    return {
      fileExists: (fileName) => this.fileExists(fileName),
      readFile: (fileName) => this.readFile(fileName),
      writeFile: (fileName, content) => this.writeFile(fileName, content),
      deleteFile: (fileName) => this.deleteFile(fileName)
    };
  }
}
function loadLocalTypeScript(appPath) {
  try {
    const requirePath = require.resolve("typescript", { paths: [appPath] });
    const ts = require(requirePath);
    return ts;
  } catch (error) {
    throw new Error(
      `Failed to load TypeScript from ${appPath} because of ${error}`
    );
  }
}
function findTypeScriptConfig(appPath) {
  const possibleConfigs = [
    // For vite applications, we want to check tsconfig.app.json, since it's the
    // most important one (client-side app).
    // The tsconfig.json in vite apps is a project reference and doesn't
    // actually check anything unless you do "--build" which requires a complex
    // programmatic approach
    "tsconfig.app.json",
    // For Next.js applications, it typically has a single tsconfig.json file
    "tsconfig.json"
  ];
  for (const config of possibleConfigs) {
    const configPath = path__namespace.join(appPath, config);
    if (fs__namespace.existsSync(configPath)) {
      return configPath;
    }
  }
  throw new Error(
    `No TypeScript configuration file found in ${appPath}. Expected one of: ${possibleConfigs.join(", ")}`
  );
}
async function runTypeScriptCheck(ts, vfs, {
  appPath,
  tsconfigPath,
  tsBuildInfoCacheDir
}) {
  return runSingleProject(ts, vfs, {
    appPath,
    tsconfigPath,
    tsBuildInfoCacheDir
  });
}
async function runSingleProject(ts, vfs, {
  appPath,
  tsconfigPath,
  tsBuildInfoCacheDir
}) {
  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
    tsconfigPath,
    void 0,
    // No additional options
    {
      // Custom system object that can handle our virtual files
      ...ts.sys,
      fileExists: (fileName) => vfs.fileExists(fileName),
      readFile: (fileName) => vfs.readFile(fileName),
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(
          `TypeScript config error: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
        );
      }
    }
  );
  if (!parsedCommandLine) {
    throw new Error(`Failed to parse TypeScript config: ${tsconfigPath}`);
  }
  const options = { ...parsedCommandLine.options };
  if (!options.tsBuildInfoFile && options.incremental !== false) {
    const tmpDir = tsBuildInfoCacheDir;
    if (!fs__namespace.existsSync(tmpDir)) {
      fs__namespace.mkdirSync(tmpDir, { recursive: true });
    }
    const configName = path__namespace.basename(tsconfigPath, path__namespace.extname(tsconfigPath));
    const appHash = Buffer.from(appPath).toString("base64").replace(/[/+=]/g, "_");
    options.tsBuildInfoFile = path__namespace.join(
      tmpDir,
      `${appHash}-${configName}.tsbuildinfo`
    );
    options.incremental = true;
  }
  let rootNames = parsedCommandLine.fileNames;
  const virtualTsFiles = vfs.getVirtualFiles().map((file) => path__namespace.resolve(appPath, file.path)).filter(isTypeScriptFile);
  const deletedFiles = vfs.getDeletedFiles().map((file) => path__namespace.resolve(appPath, file));
  rootNames = rootNames.filter((fileName) => {
    const resolvedPath = path__namespace.resolve(fileName);
    return !deletedFiles.includes(resolvedPath);
  });
  for (const virtualFile of virtualTsFiles) {
    if (!rootNames.includes(virtualFile)) {
      rootNames.push(virtualFile);
    }
  }
  const host = createVirtualCompilerHost(ts, appPath, vfs, options);
  const builderProgram = ts.createIncrementalProgram({
    rootNames,
    options,
    host,
    configFileParsingDiagnostics: ts.getConfigFileParsingDiagnostics(parsedCommandLine)
  });
  const diagnostics = [
    ...builderProgram.getSyntacticDiagnostics(),
    ...builderProgram.getSemanticDiagnostics(),
    ...builderProgram.getGlobalDiagnostics()
  ];
  builderProgram.emit();
  const problems = [];
  for (const diagnostic of diagnostics) {
    if (!diagnostic.file) continue;
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start
    );
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      "\n"
    );
    if (diagnostic.category !== ts.DiagnosticCategory.Error) {
      continue;
    }
    const sourceLines = diagnostic.file.getFullText().split(/\r?\n/);
    const lineBefore = line > 0 ? sourceLines[line - 1] : "";
    const problematicLine = sourceLines[line] || "";
    const lineAfter = line < sourceLines.length - 1 ? sourceLines[line + 1] : "";
    let snippet = "";
    if (lineBefore) snippet += lineBefore + "\n";
    snippet += problematicLine + " // <-- TypeScript compiler error here\n";
    if (lineAfter) snippet += lineAfter;
    problems.push({
      file: normalizePath(path__namespace.relative(appPath, diagnostic.file.fileName)),
      line: line + 1,
      // Convert to 1-based
      column: character + 1,
      // Convert to 1-based
      message,
      code: diagnostic.code,
      snippet: snippet.trim()
    });
  }
  return {
    problems
  };
}
function createVirtualCompilerHost(ts, appPath, vfs, compilerOptions) {
  const host = ts.createIncrementalCompilerHost(compilerOptions);
  host.readFile = (fileName) => {
    return vfs.readFile(fileName);
  };
  host.fileExists = (fileName) => {
    return vfs.fileExists(fileName);
  };
  host.getCurrentDirectory = () => appPath;
  const originalWriteFile = host.writeFile;
  host.writeFile = (fileName, data, writeByteOrderMark, onError) => {
    if (fileName.endsWith(".tsbuildinfo")) {
      originalWriteFile?.call(
        host,
        fileName,
        data,
        !!writeByteOrderMark,
        onError
      );
    }
  };
  return host;
}
function isTypeScriptFile(fileName) {
  const ext = path__namespace.extname(fileName).toLowerCase();
  return [".ts", ".tsx", ".js", ".jsx"].includes(ext);
}
async function processTypeScriptCheck(input) {
  try {
    const { appPath, virtualChanges, tsBuildInfoCacheDir } = input;
    const ts = loadLocalTypeScript(appPath);
    const vfs = new SyncVirtualFileSystemImpl(appPath, {
      fileExists: (fileName) => ts.sys.fileExists(fileName),
      readFile: (fileName) => ts.sys.readFile(fileName)
    });
    vfs.applyResponseChanges(virtualChanges);
    const tsconfigPath = findTypeScriptConfig(appPath);
    const result = await runTypeScriptCheck(ts, vfs, {
      appPath,
      tsconfigPath,
      tsBuildInfoCacheDir
    });
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
node_worker_threads.parentPort?.on("message", async (input) => {
  const output = await processTypeScriptCheck(input);
  node_worker_threads.parentPort?.postMessage(output);
});
function normalizePath(path2) {
  return path2.replace(/\\/g, "/");
}
//# sourceMappingURL=tsc_worker.js.map

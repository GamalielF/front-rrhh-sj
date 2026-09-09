import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function stripComments(jsonStr) {
  return jsonStr.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (match, group) => {
    return group ? '' : match;
  });
}

async function getProjectName() {
  const arg = process.argv[2];
  if (arg && arg.trim().length > 0) {
    return arg.trim();
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter project name: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      copyDir(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

function generateApp(name) {
  console.log(`[1/6] Generating...`);
  execSync(`pnpm ng g app ${name} --style=css --ssr=false --interactive=false`, {
    cwd: rootDir,
    stdio: 'inherit',
  });
}

function copyBaseFiles(name) {
  console.log(`[2/6] Copying base template...`);
  const baseDir = path.join(rootDir, 'base');
  const targetDir = path.join(rootDir, 'projects', name);
  if (fs.existsSync(baseDir)) {
    copyDir(baseDir, targetDir);
  }
}

function cleanAppTemplate(name) {
  console.log(`[3/6] Resetting app.html...`);
  const appDir = path.join(rootDir, 'projects', name, 'src', 'app');
  const htmlFile = path.join(appDir, 'app.html');
  const componentHtmlFile = path.join(appDir, 'app.component.html');

  const file = fs.existsSync(htmlFile) ? htmlFile : fs.existsSync(componentHtmlFile) ? componentHtmlFile : null;
  if (file) {
    fs.writeFileSync(file, '<router-outlet></router-outlet>\n', 'utf8');
  }
}

function updateTsConfigApp(name) {
  console.log(`[4/6] Updating tsconfig.app.json...`);
  const tsConfigPath = path.join(rootDir, 'projects', name, 'tsconfig.app.json');
  if (!fs.existsSync(tsConfigPath)) return;

  const raw = fs.readFileSync(tsConfigPath, 'utf8');
  const config = JSON.parse(stripComments(raw));
  config.compilerOptions = config.compilerOptions || {};
  config.compilerOptions.paths = config.compilerOptions.paths || {};

  // Setup @lumen wildcard path and standard aliases
  config.compilerOptions.paths['@lumen/*'] = ['../../libs/*/src/public-api.ts'];
  config.compilerOptions.paths['@models'] = ['./src/app/core/models'];
  config.compilerOptions.paths['@services'] = ['./src/app/core/services'];
  config.compilerOptions.paths['@components'] = ['./src/app/shared/components'];
  config.compilerOptions.paths['@components/*'] = ['./src/app/shared/components/*'];
  config.compilerOptions.paths['@environments/*'] = ['./src/environments/*'];
  config.compilerOptions.paths['@core/*'] = ['./src/app/core/*'];
  config.compilerOptions.paths['@/*'] = ['./src/*'];

  fs.writeFileSync(tsConfigPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

function updateAngularJson(name) {
  console.log(`[5/6] Updating angular.json...`);
  const configPath = path.join(rootDir, 'angular.json');
  if (!fs.existsSync(configPath)) return;

  const raw = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(stripComments(raw));
  const project = config.projects?.[name];
  const buildOptions = project?.architect?.build?.options;

  if (buildOptions) {
    buildOptions.assets = buildOptions.assets || [];
    const taigaAsset = {
      glob: '**/*',
      input: 'node_modules/@taiga-ui/icons/src',
      output: 'assets/taiga-ui/icons',
    };

    const exists = buildOptions.assets.some(
      (item) => typeof item === 'object' && item.input === taigaAsset.input
    );
    if (!exists) {
      buildOptions.assets.push(taigaAsset);
    }

    const baseAsset = {
      glob: '**/*',
      input: 'libs/base/src/assets',
      output: '',
    };
    const baseExists = buildOptions.assets.some(
      (item) => typeof item === 'object' && item.input === baseAsset.input
    );
    if (!baseExists) {
      buildOptions.assets.push(baseAsset);
    }

    buildOptions.styles = [
      'node_modules/@taiga-ui/styles/taiga-ui-theme.less',
      `projects/${name}/src/styles.css`,
      'libs/ui/src/styles.css',
    ];

    buildOptions.stylePreprocessorOptions = {
      includePaths: ['projects', 'libs'],
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  }
}

function updatePackageJson(name) {
  console.log(`[6/6] Updating package.json...`);
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const raw = fs.readFileSync(pkgPath, 'utf8');
  const pkg = JSON.parse(stripComments(raw));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts[`start:${name}`] = `pnpm build:libs && ng serve ${name} --open`;
  pkg.scripts[`build:${name}`] = `pnpm build:libs && ng build ${name}`;

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

async function run() {
  const inputName = await getProjectName();

  if (!inputName) {
    console.error('Error: Project name is required.');
    process.exit(1);
  }

  const name = inputName.toLowerCase().replace(/\s+/g, '-');

  try {
    generateApp(name);
    copyBaseFiles(name);
    cleanAppTemplate(name);
    updateTsConfigApp(name);
    updateAngularJson(name);
    updatePackageJson(name);

    console.log(`\nProject "${name}" created successfully.`);
    console.log(`Run command: pnpm start:${name}\n`);
  } catch (error) {
    console.error('Failed to create project:', error.message);
    process.exit(1);
  }
}

run();

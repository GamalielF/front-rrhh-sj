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
    const dir = path.join(rootDir, 'projects', arg.trim());
    if (!fs.existsSync(dir)) {
      console.error(`Error: Project ${dir} does not exist.`);
      process.exit(1);
    }
    return arg.trim();
  }
  console.error('You need to pass a project name as an argument.');
  process.exit(1);
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
  let project = config.projects?.[name];
  if (!project) {
    project = {
      "projectType": "application",
      "schematics": {},
      "root": `projects/${name}`,
      "sourceRoot": `projects/${name}/src`,
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": `projects/${name}/src/main.ts`,
            "tsConfig": `projects/${name}/tsconfig.app.json`,
            "assets": [
              {
                "glob": "**/*",
                "input": `projects/${name}/public`
              }
            ],
            "styles": [
              `projects/${name}/src/styles.css`
            ]
          },
          "configurations": {
            "production": {
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "1MB",
                  "maximumError": "2MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "8kB",
                  "maximumError": "16kB"
                }
              ],
              "outputHashing": "all"
            },
            "development": {
              "optimization": false,
              "extractLicenses": false,
              "sourceMap": true
            }
          },
          "defaultConfiguration": "production"
        },
        "serve": {
          "builder": "@angular/build:dev-server",
          "configurations": {
            "production": {
              "buildTarget": `${name}:build:production`
            },
            "development": {
              "buildTarget": `${name}:build:development`
            }
          },
          "defaultConfiguration": "development"
        },
        "test": {
          "builder": "@angular/build:unit-test"
        }
      }
    }
    config.projects[name] = project;
  }
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

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const protectedProjects = ['shared-ui', 'shared-auth', 'shared-http', 'ui', 'auth', 'http'];

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
    rl.question('Enter project name to remove: ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function removeProjectDir(name) {
  console.log(`[1/4] Removing project files...`);
  const projectDir = path.join(rootDir, 'projects', name);
  if (fs.existsSync(projectDir)) {
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
}

function removeFromAngularJson(name) {
  console.log(`[2/4] Updating angular.json...`);
  const configPath = path.join(rootDir, 'angular.json');
  if (!fs.existsSync(configPath)) return;

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (config.projects && config.projects[name]) {
    delete config.projects[name];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf8');
  }
}

function removeFromTsConfig(name) {
  console.log(`[3/4] Updating tsconfig.json...`);
  const tsConfigPath = path.join(rootDir, 'tsconfig.json');
  if (!fs.existsSync(tsConfigPath)) return;

  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  if (Array.isArray(tsConfig.references)) {
    const targetPrefix = `./projects/${name}/`;
    tsConfig.references = tsConfig.references.filter(
      (ref) => !ref.path || !ref.path.startsWith(targetPrefix)
    );
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2) + '\n', 'utf8');
  }
}

function removeFromPackageJson(name) {
  console.log(`[4/4] Updating package.json...`);
  const pkgPath = path.join(rootDir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.scripts) {
    delete pkg.scripts[`start:${name}`];
    delete pkg.scripts[`build:${name}`];
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }
}

async function run() {
  const inputName = await getProjectName();

  if (!inputName) {
    console.error('Error: Project name is required.');
    process.exit(1);
  }

  const name = inputName.toLowerCase().replace(/\s+/g, '-');

  if (protectedProjects.includes(name)) {
    console.error(`Error: Cannot remove protected project "${name}".`);
    process.exit(1);
  }

  try {
    removeProjectDir(name);
    removeFromAngularJson(name);
    removeFromTsConfig(name);
    removeFromPackageJson(name);

    console.log(`\nProject "${name}" removed successfully.\n`);
  } catch (error) {
    console.error('Failed to remove project:', error.message);
    process.exit(1);
  }
}

run();

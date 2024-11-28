const path = require('node:path');
const tar = require('tar');
const fs = require('node:fs');

function openPackage(filePath, pluginManager) {
  const resolved = path.resolve(`./plugins/${filePath}`);
  const pathToEx = path.resolve(`./tmp/_${filePath.replaceAll("/", "_")}`);
  fs.mkdirSync(pathToEx, { recursive: true });
  tar.x({
    file: resolved,
    cwd: pathToEx,
    sync: true
  });
  const cfgPath = path.resolve(pathToEx, "package.json");
  const { main, name, description, author, version, freedeck } = require(cfgPath);
  if(!freedeck) {
    console.error(`[Plugin Manager / FDPackage] Error: ${filePath} does not contain a Freedeck package definition.`);
    return;
  }
  if(freedeck.package !== 'plugin' && freedeck.package !== 'theme') {
    console.error(`[Plugin Manager / FDPackage] Error: ${freedeck.package} is not a valid Freedeck package type.`);
    return;
  }
  if(freedeck.package === 'plugin') {
    const entryPath = path.resolve(pathToEx, main);
    const entry = require(entryPath);
    try {
      entry.class._usesAsar = false;
      const instantiated = entry.exec();
      pluginManager._plc.set(instantiated.id, { instance: instantiated });
      if (instantiated.disabled) {
        pluginManager._disabled.push(filePath);
        return;
      }
      if (fs.existsSync(path.resolve(`./plugins/${instantiated.id}/settings.json`))) {
        const settings = JSON.parse(
          fs.readFileSync(
            path.resolve(`./plugins/${instantiated.id}/settings.json`),
          ),
        );
        pluginManager._settings.set(instantiated.id, settings);
      }
    } catch(er) {
      console.error(`[Plugin Manager / FDPackage] Error while trying to load unpacked plugin ${filePath}: ${er}`);
    }
  } else if(freedeck.package === 'theme') {
    if(!fs.existsSync(path.resolve(`webui/hooks/_themes/${name}`))) {
      fs.mkdirSync(path.resolve(`webui/hooks/_themes/${name}`), { recursive: true });
    }
    if(freedeck.files) {
      for(const file of freedeck.files) {
        if(!fs.existsSync(path.resolve(pathToEx, file))) {
          console.error(`[Plugin Manager / FDPackage] Error: ${file} does not exist in ${filePath}`);
          continue;
        }
        const dest = path.resolve(`webui/hooks/_themes/${name}/${file}`);
        fs.copyFileSync(path.resolve(pathToEx, file), dest);
      }
    }
    const themeMeta = `:theme-meta {
      --name: "${freedeck.title}";
      --description: "${description}";
      --author: "${author}";
      --version: "${version}";
      }\n`;  
    fs.appendFileSync(path.resolve(`webui/hooks/_themes/${name}.css`), themeMeta);

    fs.appendFileSync(path.resolve(`webui/hooks/_themes/${name}.css`), fs.readFileSync(path.resolve(pathToEx, main)));
  }
  console.log(`[Plugin Manager / FDPackage] Loaded ${freedeck.package} ${freedeck.title} - ID ${name}`);
}


module.exports = {
  openPackage
}
import * as semver from 'semver';
import * as ini from 'ini';
import { IniParser } from './IniHandler'
import fetch from 'node-fetch';
import { Octokit } from "@octokit/core";

const kaelRoot = 'https://raw.githubusercontent.com/SuperKael/Roguelands-Mods/master/';
if (!process.env.GITHUB_KEY) {
  throw new Error('Missing GITHUB_KEY environment variable. Please add it to your .env file');
}
const octokit = new Octokit({ auth: process.env.GITHUB_KEY });

export enum ModSource {
  Git = 'git',
  URL = 'url'
}

export enum ModProperty {
  Name = 'name',
  Author = 'author',
  Version = 'version',
  GCVersion = 'gcVersion',
  Description = 'description',
  RootPath = 'rootPath',
  VerPath = 'verPath',
  DataPath = 'dataPath',
  FilePath = 'filePath',
  Source = 'source',
  Dependencies = 'dependencies',
  Incompatibilities = 'incompatible',
  ReleaseState = 'releaseState'
}

export class Mod {
  readonly id?: Number
  readonly key?: string
  name?: string
  author?: string
  version?: string
  gcVersion?: string
  description?: string
  dataPath?: string
  verPath?: string
  filePath?: string
  rootPath?: string
  source?: ModSource
  dependencies?: Array<Mod>
  incompatible?: Array<Mod>

  constructor(inKey: string) {
    this.key = inKey;
  }
}
export const ModParser = async (modLine: Array<string>): Promise<Mod> => {
  let mod = new Mod(modLine[0]);
  for (let modParam of modLine[1].split(',')) {
    let paramParts = modParam.split(':');

    if (paramParts[0] == 'Name') {
      mod.name = ini.safe(paramParts[1]);
    }
    else if (paramParts[0] == 'URL') {
      paramParts.shift();
      let link = paramParts.join(':');
      if (link.slice(0, 1) == '/') {
        link = kaelRoot + link.slice(1);
      }
      mod.dataPath = link;
      mod.source = ModSource.URL;
      let modRawData: string = await fetch(link).then(prom => prom.text());
      let modData = ini.parse(modRawData);
      if (Object.keys(modData).length === 1) {
        modData = modData[Object.keys(modData)[0]];
      }
      for (let currentKey of Object.keys(modData)) {
        let iniValue = IniParser(currentKey, modData[currentKey]);
        if (!iniValue) continue;
        mod[iniValue.key] = iniValue.value;
      }
      if (!mod.rootPath) {
        mod.rootPath = kaelRoot;
      }
      // Process version.ini
      if (mod.verPath) {
        if (mod.verPath.slice(0, 1) == '/') {
          mod.verPath = (mod.rootPath + mod.verPath).replace(/(?<!https?:)\/\//g, '/');
        }
        let versionData = ini.parse(await fetch(mod.verPath).then(prom => prom.text()));
        if (Object.keys(versionData).length === 1) {
          versionData = versionData[Object.keys(versionData)[0]];
        }
        for (let currentKey of Object.keys(versionData)) {
          let iniValue = IniParser(currentKey, versionData[currentKey]);
          if (!iniValue) continue;
          mod[iniValue.key] = iniValue.value;
        }
      }
      if (mod.filePath.slice(0, 1) == '/') {
        mod.filePath = (mod.rootPath + mod.filePath).replace(/(?<!https?:)\/\//g, '/');
      }
    } else if (paramParts[0] == 'Git') {
      let gitUser = paramParts[1], gitRepo = paramParts[2], releaseRegex = paramParts[3];
      mod.dataPath = `https://api.github.com/repos/${gitUser}/${gitRepo}`;
      mod.source = ModSource.Git;
      let repoData = (await octokit.request(`GET /repos/${gitUser}/${gitRepo}`)).data;
      let releaseData = (await octokit.request(`GET /repos/${gitUser}/${gitRepo}/releases`)).data[0];
      mod.description = repoData.description;
      mod.author = repoData.owner.login;
      let latestRelease = releaseData.assets.filter((rel) => {
        try {
          return (new RegExp(releaseRegex).test(rel['browser_download_url']));
        } catch {
          return false;
        }
      })[0];
      mod.filePath = latestRelease['browser_download_url'];
      if (semver.coerce(releaseData.tag_name)) {
        mod.version = semver.coerce(releaseData.tag_name).version;
      } else {
        mod.version = semver.coerce(releaseData.tag_name).version;
      }
    }

  };
  return mod;
}

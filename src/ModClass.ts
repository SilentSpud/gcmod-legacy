import SemVer from 'semver/classes/semver';

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
  version?: SemVer
  gcVersion?: SemVer
  description?: string
  dataPath?: string
  filePath?: string
  source?: ModSource
  dependencies?: Array<Mod>
  incompatible?: Array<Mod>

  constructor(inKey:string) {
    if (!inKey || typeof inKey != 'string') {
      throw new TypeError('Invalid arguments')
    }
    this.key = inKey;
  }
}

import { ModProperty } from './ModHandler'

export enum IniKey {
  Name = 'Name', // Mod name
  Author = 'Author', // Mod author
  Version = 'Version', // Mod version
  Description = 'Description', // Mod description
  GCVersion = 'GCVersion', // Compatible Gadget Core version
  RootPath = 'RootPath', // Root for relative paths
  DataPath = 'URL', // Path to version.ini
  FilePath = 'File', // Path to the mod package
  // Elements below aren't integrated yet
  Dependencies = 'Dependencies', // Comma-separated list of mod keys of dependencies
  OtherVersions = 'OtherVersions', // Comma-separated kv pairs of previous version.ini
  State = 'State', // Mod release state
  Downloads = 'Downloads', // Download count
}
export type IniElement = { key: ModProperty, value: (string) };

export const IniParser = (keyName: string, keyValue: (string | boolean)): (false | IniElement) => {
  // Return false for boolean dud keys
  if (typeof keyValue == 'boolean') return false;

  switch (keyName) {
    case IniKey.Name:
      return { key: ModProperty.Name, value: keyValue };
    case IniKey.Author:
      return { key: ModProperty.Author, value: keyValue };
    case IniKey.Version:
      return { key: ModProperty.Version, value: keyValue };
    case IniKey.GCVersion:
      return { key: ModProperty.GCVersion, value: keyValue };
    case IniKey.Description:
      return { key: ModProperty.Description, value: keyValue };
    case IniKey.FilePath:
      return { key: ModProperty.FilePath, value: keyValue };
    case IniKey.DataPath:
      return { key: ModProperty.VerPath, value: keyValue };
    case IniKey.RootPath:
      return { key: ModProperty.RootPath, value: keyValue };
  }
  return false;
}

//#region Module imports
//import * as fs from 'fs';
import * as ini from 'ini';
import fetch from 'node-fetch';
//#endregion
//#region File imports
import { Mod, ModProperty, ModSource } from './ModClass';
import { IniParser } from './IniHandler'
//#endregion

const kaelRoot = 'https://raw.githubusercontent.com/SuperKael/Roguelands-Mods/master/';

const mods: Array<Mod> = [];

const conf = {
  timer: 0,
  timeout: false
};

const fetchMaster = () => {
  conf.timeout = true;
  setTimeout(() => {
    conf.timeout = false;
  }, 3600000);
  fetch(kaelRoot + 'Mods.ini').then(res => res.text()).then(async (data: string) => {
    let rawDat = ini.parse(data);
    for (let currKey in rawDat) {
      // TODO: Figure out why this is needed
      if (currKey.includes('[') && rawDat[currKey] === true) continue;
      let mod = await ModParser([currKey, rawDat[currKey]]);
      mods.push(mod);
      break; // TODO Remove after testing
    }
  });
  return true;
}



const ModParser = async (modLine: Array<string>): Promise<Mod> => {
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
      for (let currKey of Object.keys(modData)) {
        let iniVal = IniParser(currKey, modData[currKey]);
        if (typeof iniVal == 'boolean') continue;
        if (iniVal.key = ModProperty.RootPath) {

        }
        mod[iniVal.key] = iniVal.value;
      }

      console.log(modData);
    } else if (paramParts[0] == 'Git') {
      mod.source = ModSource.Git;
      mod.filePath = paramParts[3];
      mod.dataPath = `https://api.github.com/repos/${paramParts[1]}/${paramParts[2]}/releases`;
    }

  };
  return mod;
}
fetchMaster();

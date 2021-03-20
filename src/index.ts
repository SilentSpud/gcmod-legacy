//#region Module imports
import * as ini from 'ini';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server';
//#endregion
//#region Load .env variables
dotenv.config();
//#endregion
//#region File imports
import { Mod, ModParser } from './ModHandler';
import modSchema from './modSchema';
//#endregion

const mods: Array<Mod> = [];

const fetchMaster = () => {
  fetch('https://raw.githubusercontent.com/SuperKael/Roguelands-Mods/master/Mods.ini').then(res => res.text()).then(async (data: string) => {
    let rawDat = ini.parse(data);
    for (let currKey in rawDat) {
      // TODO: Figure out why this is needed
      if (typeof rawDat[currKey] === 'boolean') continue;
      let mod = await ModParser([currKey, rawDat[currKey]]);
      mods.push(mod);
    }
    console.log('mod list ready');
  });
}
fetchMaster();
const gqlResolvers = {
  Query: {
    mods: () => mods,
    mod: (_parent, args) => {
      return mods.find(mod => mod.key === args.key);
    },
    search: (_parent, args) => {
      return mods.filter((currMod) => {
        return (currMod.author.toLocaleLowerCase().includes(args.text) ||
        currMod.description.toLocaleLowerCase().includes(args.text) ||
        currMod.name.toLocaleLowerCase().includes(args.text) ||
        currMod.key.toLocaleLowerCase().includes(args.text));
      });
    }
  },
};

const gqlServer = new ApolloServer({ typeDefs: modSchema, resolvers: gqlResolvers });
gqlServer.listen({ host: 'localhost', port: 4000 }).then(({ url }) => console.log(`gql server ready: ${url}`));

import { gql } from 'apollo-server';

export default gql`type Mod {
  key: ID!
  name: String
  author: String
  version: String!
  gcVersion: String
  description: String
  filePath: String
  source: String
  dependencies: [Mod]
  incompatible: [Mod]
}

type Query {
  mods: [Mod]
  mod(key: String!): Mod
}

fragment ModMini on Mod {
  key
  version
  name
  filePath
}`;

const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID!
    name: String
    email: String
  }
  type AuthUser {
    UserID: ID
    token: String
  }
  type Query {
    me: User
  }
  type Mutation {
    Login(email: String, password: String): AuthUser
      @rateLimit(limit: 7, duration: 1600)
    Register(name: String, email: String, password: String): AuthUser
      @rateLimit(limit: 6, duration: 1600)
  }
`;

module.exports = typeDefs;

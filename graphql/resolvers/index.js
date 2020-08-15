const User = require("../../models/Users");
const valid = require("validator");
const fs = require("fs");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
private = fs.readFileSync("./keys/private.key");
public = fs.readFileSync("./keys/public.key");

const resolvers = {
  Query: {
    me: async (parent, args, context, info) => {
      let Auth = context.token;
      if (!Auth)
        throw new Error(
          "you need to login"
        );
      let verif = await JWT.verify(Auth, public);
      if (!verif) throw new Error("invalid JWT");
      let userData = await User.findOne({ _id: verif.uid });
      return userData;
    },
  },
  Mutation: {
    Login: async (parent, args, context, info) => {
      args.email = valid.normalizeEmail(args.email);
      if (!valid.isEmail(args.email)) return new Error("invalid email address");
      if (valid.isEmpty(args.password)) return new Error("password is empty");
      const users = await User.findOne({ email: args.email }).exec();
      if (!users) throw new Error("invalid email address or password");
      const valide = await bcrypt.compare(args.password, users.password);
      if (!valide) throw new Error("invalid email address or password");
      let token = JWT.sign({ uid: users._id }, private, { algorithm: "RS256" });
      return { UserID: users._id, token: token };
    },
    Register: async (parent, args, context, info) => {
      args.email = valid.normalizeEmail(args.email);
      if (!valid.isAlpha(args.name)) throw new Error("invalid name");
      if (!valid.isEmail(args.email)) throw new Error("invalid email address");
      if (valid.isEmpty(args.password)) throw new Error("password is empty");
      const users = await User.findOne({ email: args.email }).exec();
      if (users) throw new Error("duplicate Email!");
      let newuser = await User({
        name: args.name,
        email: args.email,
        password: args.password,
      }).save();
      let token = JWT.sign({ uid: newuser._id }, private, {
        algorithm: "RS256",
      });
      return {
        UserID: newuser._id,
        token: token,
      };
    },
  },
};

module.exports = resolvers;

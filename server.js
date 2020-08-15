const express = require("express");
const app = express();
const fs = require("fs");
const morgan = require("morgan");
const server = require("http").Server(app);
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { PORT, DB_URL } = require("./config");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const queryMap = require("./Persisted_Query_Mutation");
const { invert } = require("lodash");
private = fs.readFileSync("./keys/private.key");
public = fs.readFileSync("./keys/public.key");

const {
  createRateLimitDirective,
  createRateLimitTypeDef,
} = require("graphql-rate-limit-directive");

public = fs.readFileSync("./keys/public.key");

app.use(morgan());
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const errorHandler = (message, req, res, next) => {
  if (res.headersSent) {
    return next(message);
  }
  const { status } = message;
  res.status(status).json({ errors: [{ message }] });
};

app.use(errorHandler);

mongoose.connect(DB_URL, { useNewUrlParser: true }, function (err) {
  if (err) return console.err(err);
  console.log("Mongoose is connected");
});

app.get("/graphql", (req, res) => {
  return res.status(500).json({
    errors: {
      message: "Server supports only POST requests.",
      code: 500,
    },
  });
});

["delete", "head", "patch", "options", "link", "copy", "purge"].forEach(
  function (method) {
    app[method]("/graphql", function (req, res, next) {
      return res.status(500).json({
        errors: {
          message: "Server supports only POST requests.",
          code: 500,
        },
      });
    });
  }
);


const invertedQueryMap = invert(queryMap);

app.post(
  "/graphql",
  bodyParser.urlencoded({ extended: true }),
  bodyParser.json(),
  (req, res, _) => {
    var query = invertedQueryMap[req.body.doc_id];
    if (query == undefined) {
      return res.status(500).json({
        errors: {
          message: "The GraphQL (doc_id) document not found.",
          code: 500,
        },
      });
    }
    req.body.query = query;
    req.next();
  }
);

const graphqlServer = new ApolloServer({
  introspection: true,
  typeDefs: [createRateLimitTypeDef(), typeDefs],
  resolvers,
  schemaDirectives: {
    rateLimit: createRateLimitDirective(),
  },
  debug: false,
  playground: true,
  context: ({ req, res, next }) => {
    let token = req.header("Authorization");
    return { token };
  },
  persistedQueries: false,
});

graphqlServer.applyMiddleware({ app, path: "/graphql" });

app.use(function (req, res, _) {
  res.status(500).json({ error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

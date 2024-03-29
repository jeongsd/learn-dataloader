import { Elysia } from "elysia";
import chalk from "chalk";
import { yoga } from "@elysiajs/graphql-yoga";
import { fakeDb } from "./db";

const app = new Elysia()
  .use(
    yoga({
      context: () => ({
        fakeDb,
      }),
      typeDefs: /* GraphQL */ `
        type Query {
          topProducts: [Product!]!
        }

        type Product {
          id: ID!
          name: String!
          stock: Int!
          reviews: [Review!]!
        }

        type Review {
          id: ID!
          body: String!
          author: Author!
        }

        type Author {
          name: String!
        }
      `,
      resolvers: {
        Query: {
          topProducts: async (_, _args, context) => {
            return context.fakeDb.findManyProducts();
          },
        },
        Product: {
          // @ts-ignore
          reviews: async (product, _args, context) => {
            return context.fakeDb.findReviewsByProductId(product.id);
          },
        },

        // @ts-ignore
        Review: {
          // @ts-ignore
          author: async (review, _args, context) => {
            return context.fakeDb.findAuthorById(review.authorId);
          },
        },
      },
    })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/graphql`
);

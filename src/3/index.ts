import { Elysia } from "elysia";
import chalk from "chalk";
import { yoga } from "@elysiajs/graphql-yoga";
import { fakeDb, generateDataLoaders } from "./db";

const app = new Elysia()
  .use(
    yoga({
      context: () => ({
        fakeDb,
        dataLoaders: generateDataLoaders(),
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
            console.log(`findManyProducts()`);

            return context.fakeDb.findManyProducts();
          },
        },
        Product: {
          // @ts-ignore
          reviews: async (product, _args, context) => {
            // return context.fakeDb.findReviewsByProductId(product.id);
            const result = await context.dataLoaders.review.load(product.id);

            return result;
          },
        },

        // @ts-ignore
        Review: {
          // @ts-ignore
          author: async (review, _args, context) => {
            // return context.fakeDb.findAuthorById(review.authorId);
            return context.dataLoaders.author.load(review.authorId);
          },
        },
      },
    })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/graphql`
);

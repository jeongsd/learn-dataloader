import { Elysia } from "elysia";
import chalk from "chalk";
import { yoga } from "@elysiajs/graphql-yoga";
import { db } from "./db";

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const app = new Elysia()
  .use(
    yoga({
      logging: "debug",
      context: {
        db,
      },
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
            await delay(1000);
            return context.db.products.all();
          },
        },
        Product: {
          // @ts-ignore
          reviews: async (product, _args, context) => {
            console.log(
              chalk.greenBright(
                `start product.findMany(${product.id}).reviews()`
              )
            );
            await delay(1000);
            console.log(
              chalk.green(`end product.findMany(${product.id}).reviews()`)
            );

            return context.db.reviews.all().filter(
              // @ts-ignore
              (review) => review.productId === product.id
            );
          },
        },

        // @ts-ignore
        Review: {
          // @ts-ignore
          author: async (review, _args, context) => {
            console.log(
              chalk.magenta(`start review.find(${review.id}).author()`)
            );
            await delay(1000);
            console.log(
              chalk.magenta(`end review.find(${review.id}).author()`)
            );

            return context.db.authors.find(
              // @ts-ignore
              (author) => author.id === review.authorId
            );
          },
        },
      },
    })
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}/graphql`
);

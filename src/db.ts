import DataLoader from "dataloader";
import chalk from "chalk";
import { createDatabase, createFactory } from "typical-data";
import _ from "lodash";

interface Author {
  name: string;
  id: string;
}

interface Review {
  id: string;
  body: string;
  productId: string;
  authorId: string;
}
interface Product {
  id: string;
  name: string;
  stock: number;
}

export const authorFactory = createFactory<Author>({
  name: ({ sequence }) => `Author ${sequence}`,
  id: ({ sequence }) => `${sequence}`,
});

// @ts-ignore
export const reviewFactory = createFactory<Review>({
  id: ({ sequence }) => `${sequence}`,
  body: ({ sequence }) => `Great product ${sequence}`,
  productId: ({ sequence }) =>
    db.products.all()[Math.floor(Math.random() * db.products.all().length)]
      .id as string,
  authorId: ({ sequence }) =>
    db.authors.all()[Math.floor(Math.random() * db.authors.all().length)]
      .id as string,
});

export const productFactory = createFactory<Product>({
  id: ({ sequence }) => `${sequence}`,
  name: ({ sequence }) => `Product ${sequence}`,
  stock: 10,
});

// @ts-ignore
export const db = createDatabase({
  factories: {
    products: productFactory,
    reviews: reviewFactory,
    authors: authorFactory,
  },
});

export function findManyProducts() {
  return db.products.all();
}

export async function findReviewsByProductId(productId: string) {
  const idNumber = Number(productId);
  return db.reviews.all().filter((review: any) => {
    const reviewIdNumber = Number(review.id);
    return reviewIdNumber <= idNumber;
  });
}

db.products.createList(100);
db.authors.createList(1000);
db.reviews.createList(1000);

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const fakeDelayMap = {
  findManyProducts: 0,
  findReviewsByProductId: 0,
  findReviewsByProductIds: 0,
  findAuthorById: 0,
  findManyAuthors: 0,
};

async function logAndDelay(msg: string, key: keyof typeof fakeDelayMap) {
  const ms = fakeDelayMap[key] * 10;
  fakeDelayMap[key] += 1;
  console.log("start", msg);
  await delay(ms);
  console.log("end", msg);
  fakeDelayMap[key] -= 1;
}

export const fakeDb = {
  findManyProducts: async () => {
    await logAndDelay(
      chalk.yellow("SELECT * FROM products"),
      "findManyProducts"
    );
    return db.products.all();
  },
  findReviewsByProductId: async (productId: string) => {
    await logAndDelay(
      chalk.green("SELECT * FROM reviews WHERE productId = ?", productId),
      "findReviewsByProductId"
    );
    return db.reviews
      .all()
      .filter((review: Review) => review.productId === productId);
  },
  findReviewsByProductIds: async (productIds: readonly string[]) => {
    await logAndDelay(
      chalk.green("SELECT * FROM reviews WHERE productId IN ?", productIds),
      "findReviewsByProductIds"
    );

    return db.reviews
      .all()
      .filter((review: any) => productIds.includes(review.productId));
  },
  findAuthorById: async (authorId: string) => {
    await logAndDelay(
      chalk.magenta("SELECT * FROM authors WHERE id = ?", authorId),
      "findAuthorById"
    );
    return db.authors.find((author: any) => author.id === authorId);
  },
  findManyAuthors: async (authorIds: readonly string[]) => {
    await logAndDelay(
      chalk.magenta("SELECT * FROM authors WHERE id IN ?", authorIds),
      "findManyAuthors"
    );
    return db.authors
      .all()
      .filter((author: any) => authorIds.includes(author.id));
  },
};

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
db.authors.createList(100);
db.reviews.createList(1000);

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const fakeDb = {
  findManyProducts: async () => {
    // SQL Query
    console.log(chalk.yellow("SELECT * FROM products"));
    await delay(1000);
    return db.products.all();
  },
  findReviewsByProductId: async (productId: string) => {
    // SQL Query
    console.log(
      chalk.green("SELECT * FROM reviews WHERE productId = ?", productId)
    );
    await delay(1000);
    return db.reviews.all().filter(
      // @ts-ignore
      (review) => review.productId === productId
    );
  },
  findReviewsByProductIds: async (productIds: readonly string[]) => {
    // SQL Query
    console.log(
      chalk.green("SELECT * FROM reviews WHERE productId IN ?", productIds)
    );
    await delay(1000);
    return db.reviews
      .all()
      .filter((review) => productIds.includes(review.productId));
  },
  findAuthorById: async (authorId: string) => {
    // SQL Query
    console.log(chalk.magenta("SELECT * FROM authors WHERE id = ?", authorId));

    await delay(2000);
    return db.authors.find((author) => author.id === authorId);
  },
  findManyAuthors: async (authorIds: readonly string[]) => {
    // SQL Query
    console.log(
      chalk.magenta("SELECT * FROM authors WHERE id IN ?", authorIds)
    );
    await delay(2000);
    return db.authors.all().filter((author) => authorIds.includes(author.id));
  },
};

export function generateDataLoaders() {
  type ProductId = string;

  const authorDataLoader = new DataLoader<ProductId, Review>(
    async (keys: readonly ProductId[]) => {
      return fakeDb.findManyAuthors(keys);
    },
    {
      // batchScheduleFn: (callback) => setTimeout(callback, 1000),
    }
  );

  type ReviewKey = string; // Using the Product ID as the key for loading reviews
  const reviewDataLoader = new DataLoader<ReviewKey, Review[]>(
    async (productIds: readonly ReviewKey[]) => {
      // Fetch reviews for all product IDs in a single call
      const allReviews = await fakeDb.findReviewsByProductIds(productIds);

      // Map the fetched reviews back to the input keys
      const reviewsMappedByProductId = _.groupBy(allReviews, "productId");

      // Ensure the order and presence of results for each key
      const results = productIds.map(
        (productId) => reviewsMappedByProductId[productId] || []
      );

      return results;
    },
    {
      // batchScheduleFn: (callback) => setTimeout(callback, 1000), // Configure batch scheduling
    }
  );

  return {
    authorLoader: authorDataLoader,
    reviewLoader: reviewDataLoader,
  };
}

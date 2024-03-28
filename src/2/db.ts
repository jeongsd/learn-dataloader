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

db.products.createList(10);
db.authors.createList(100);
db.reviews.createList(1000);

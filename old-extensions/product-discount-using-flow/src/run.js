// run.js
// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: []
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  
  const customer = input.cart.buyerIdentity?.customer;

  // Skip if no customer
  if (!customer) {
    return EMPTY_DISCOUNT;
  }

  const customerTags = customer.hasTags?.filter(({ hasTag }) => hasTag).map(({ tag }) => tag) || [];
  const canCustomerOrderSample = customer.canOrderSamples?.value === "true";

  console.log("Customer Email:", customer.email);
  console.log("Customer Can Order?:", canCustomerOrderSample);
  console.log( customer.displayName ,"Customer Tags:", customerTags);

  const targets = input.cart.lines
    .filter((line) => {

      if (line.merchandise.__typename !== "ProductVariant"){
        return false;
      }

      const productTags =
        line.merchandise.product.hasTags
          ?.filter(({ hasTag }) => hasTag)
          .map(({ tag }) => tag) || [];

      const matchingTags = productTags.some((tag) => customerTags.includes(tag));
      const productHasSampleCopy = line.merchandise.product.hasSampleCopy?.value === "true";

      console.log( line.merchandise.product.title ,"Product Tags: ", productTags);
      console.log("Matching Tags:", matchingTags);

      return productHasSampleCopy && canCustomerOrderSample && matchingTags;

    })
    .map((line) => {
      return {
        productVariant: {
          id: line.merchandise.id,
          quantity: 1
        }
      };
    });

  // console.log("Product Metafield:", JSON.stringify(input.cart.lines[0].merchandise.product.metafield, null, 2));
  // console.log("Buyer Identity:", JSON.stringify(input.cart.buyerIdentity, null, 2));
  //console.log("Targets:", JSON.stringify(targets, null, 2));
  // console.log("Has Tags:", JSON.stringify(input.cart.buyerIdentity?.customer?.hasTags, null, 2));
  
  // If no targets, return empty discount
  if (targets.length === 0) {
    return EMPTY_DISCOUNT;
  }


  const DISCOUNTED_ITEMS = {
    discountApplicationStrategy: DiscountApplicationStrategy.First,
    discounts: [
      {
        targets: targets,
        value: {
          percentage: {
            value: 100,
          }
        },
        message: "This is discount of 100% off for Tagged Products and Customers",
      },
    ],
  };

  // console.log("Discounted Items:", JSON.stringify(DISCOUNTED_ITEMS, null, 2));

  return DISCOUNTED_ITEMS;
};
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

  const targets = input.cart.lines
    .filter((line) => {
      if(line.merchandise.__typename === "ProductVariant"){


        const isTaggedProduct = line.merchandise.product.hasAnyTag;

        // if Product has any one of the Tag:  ["teacher", "journalist", "influencer"]
        if(isTaggedProduct){

          const productTags = line.merchandise.product.hasTags || []
          const customerTags = input.cart.buyerIdentity?.customer?.hasTags || []

          // Extract tag names
          const productTagNames = productTags.filter(({ hasTag }) => hasTag).map(({ tag }) => tag);
          const customerTagNames = customerTags.filter(({ hasTag }) => hasTag).map(({ tag }) => tag);

          const matchingTags = productTagNames.filter(tag => customerTagNames.includes(tag));

          console.log("Product Tags: ", productTagNames);
          console.log("Customer Tags: ", customerTagNames);
          

          console.log("Matching Tags:", matchingTags);

          const canCustomerOrderSample = input.cart.buyerIdentity?.customer?.metafield?.value === "true";
          const productHasSampleCopy = line.merchandise.product.metafield?.value === "true";

          return productHasSampleCopy && canCustomerOrderSample && matchingTags.length > 0;
        }
      }
      return false;
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
  // console.log("Targets:", JSON.stringify(targets, null, 2));
  // console.log("Has Tags:", JSON.stringify(input.cart.buyerIdentity?.customer?.hasTags, null, 2));
  
  console.log("Customer Email: ", input.cart.buyerIdentity?.customer?.email);
  console.log("Customer Can Order? : ", input.cart.buyerIdentity?.customer?.metafield?.value);
  

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
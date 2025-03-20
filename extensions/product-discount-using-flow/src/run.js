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

      if (line.merchandise.__typename !== "ProductVariant"){
        return false;
      }

      console.log("Product:", line.merchandise.product.title, ", Sample Copy:", line.merchandise.product.hasSampleCopy?.value ?? false);
      console.log("Customer:", customer.displayName , ", Can Order Sample:", customer.canOrderSamples?.value ?? false);
      

      return true;

    })
    .map((line) => {
      return {
        productVariant: {
          id: line.merchandise.id,
          quantity: 1
        }
      };
    });
  
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
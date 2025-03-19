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
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  
  const targets = input.cart.lines
    .filter((line) => {
      if(line.merchandise.__typename === "ProductVariant"){
        const isTaggedProduct = line.merchandise.product.hasAnyTag;
        const isTaggedCustomer = input.cart.buyerIdentity?.customer?.hasAnyTag;
        return isTaggedProduct && isTaggedCustomer;
      }
      return false;
    })
    .map((line) => {
      return {
        productVariant: {
          id: line.merchandise.id,
        }
      };
    });

  console.log(JSON.stringify(targets, null, 2));
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
        message: "This is a test discount for 100% off and for Tagged Products and Customers",
      },
    ],
  };

  console.log("Discounted Items:", JSON.stringify(DISCOUNTED_ITEMS, null, 2));

  return DISCOUNTED_ITEMS;
};
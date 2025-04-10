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
    console.log("No Customer LOGGED IN")
    return EMPTY_DISCOUNT;
  }

  const canCustomerOrderSample = customer.canOrderSamples?.value === "true";
  const customerSegment = customer.customerSegment?.value;
  const claimedFreeSampleCopyProductIds = customer.claimedFreeSampleCopyProductIds?.jsonValue || [];

  console.log("Customer Email:", customer.email);
  console.log("Customer Can Order?:", canCustomerOrderSample);
  console.log("Customer Name:", customer.displayName);
  console.log("Customer Segment:", customerSegment);

  console.log("Customer Product IDs", JSON.stringify(customer.claimedFreeSampleCopyProductIds, null, 2));

  const targets = input.cart.lines
    .filter((line) => {

      if (line.merchandise.__typename !== "ProductVariant") {
        return false;
      }

      const productSegment = line.merchandise?.product.productSegment?.value;

      const matchingSegment = customerSegment === productSegment;

      // The Product Metafield: has_sample_copy should be TRUE and mentioning === is must as without it the checking is not validated properly
      const productHasSampleCopy = line.merchandise.product.hasSampleCopy?.value === 'true';

      // The Customer should not have claimed the product before
      const alreadyClaimedSampleCopy = claimedFreeSampleCopyProductIds.includes(line.merchandise.product.id);

      // All Conditions for the Discounting a Product
      const isProductEligibleForDiscount = productHasSampleCopy && canCustomerOrderSample && matchingSegment && !alreadyClaimedSampleCopy;

      console.log("Discount on Product: ", isProductEligibleForDiscount);

      return isProductEligibleForDiscount;

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
        message: `FREE SAMPLE COPY for ${input.cart.buyerIdentity?.customer?.displayName}`,
      },
    ],
  };

  return DISCOUNTED_ITEMS;
};
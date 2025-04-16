/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  const customer = input.cart.buyerIdentity?.customer;

  const customerTags = customer?.hasTags?.filter(({ hasTag }) => hasTag).map(({ tag }) => tag) || [];

  const cartSubtotal = parseFloat(input.cart.cost.subtotalAmount.amount);
  const currencyCode = input.cart.cost.subtotalAmount.currencyCode;

  let discountValue = null;
  let minOrderValue = null;

  // Adjust shipping cost based on customer tags and thresholds
  if (customerTags.includes("b2b")) {
    discountValue = 100; // Free shipping for B2B
    minOrderValue = 0; // No minimum order value
  } else if (customerTags.includes("lannoo")) {
    discountValue = 100; // Free shipping for Lannoo
    minOrderValue = 25; // Minimum €25
  } else if (customerTags.includes("campus")) {
    discountValue = 100; // Free shipping for Campus
    minOrderValue = 50; // Minimum €50
  }

  console.log("Customer Email:", customer?.email);
  console.log( customer.displayName ,"Customer Tags:", customerTags);
  console.log("Shipping Threshold", freeShippingThreshold);
  
  

  // If no matching tag or order value is below the threshold, return no discount
  if (discountValue === null || cartSubtotal < minOrderValue) {
    return EMPTY_DISCOUNT;
  }

  return {
    discounts: [
      {
        message: `Free shipping for orders above €${minOrderValue}`,
        targets: [
          {
            deliveryOption: {
              handle: input.cart.deliveryGroups[0]?.deliveryOptions[0]?.handle
            },
          },
        ],
        value: {
          percentage: {
            value: discountValue.toString(),
          },
        },
      },
    ],
  };
};

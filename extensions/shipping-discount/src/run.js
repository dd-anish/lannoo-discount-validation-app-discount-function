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

  let freeShippingThreshold = null;

  // Set free shipping threshold based on customer tag
  if (customerTags.includes("b2b")) {
    freeShippingThreshold = 0; // Free shipping for B2B
  } else if (customerTags.includes("campus")) {
    freeShippingThreshold = 50; // Free shipping for Campus
  } else if (customerTags.includes("lannoo")) {
    freeShippingThreshold = 24.99; // Free shipping for Lannoo
  }

  console.log("Customer Email:", customer?.email);
  console.log( customer.displayName ,"Customer Tags:", customerTags);
  console.log("Shipping Threshold", freeShippingThreshold);
  
  

  // If no matching tag, return no discount
  if (freeShippingThreshold === null) {
    return EMPTY_DISCOUNT;
  }

  return {
    discounts: [
      {
        message: `Free shipping for orders above €${freeShippingThreshold}`,
        targets: [
          {
            orderSubtotal: {
              greaterThanOrEqualTo: {
                amount: freeShippingThreshold.toString(),
                currencyCode: "EUR",
              },
            },
            
          },
        ],
        value: {
          fixedAmount: {
            amount: "0.00",
            currencyCode: "EUR",
          },
        },
      },
    ],
  };
};

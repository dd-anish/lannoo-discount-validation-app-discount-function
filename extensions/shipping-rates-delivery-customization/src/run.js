// @ts-check

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  const customer = input.cart.buyerIdentity?.customer;

  const customerTags = customer?.hasTags?.filter(({ hasTag }) => hasTag).map(({ tag }) => tag) || [];

  const cartSubtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

  let freeShipping = false;

  if (customerTags.includes("b2b")) {
    // Free shipping for B2B
    freeShipping = true;
  } else if (customerTags.includes("lannoo") && cartSubtotal >= 25) {
    // Free shipping for Lannoo if order is above €25
    freeShipping = true;
  } else if (customerTags.includes("campus") && cartSubtotal >= 50) {
    // Free shipping for Campus if order is above €50
    freeShipping = true;
  }

  console.log(`Customer Tags: ${customerTags}`);
  console.log(`Cart Subtotal: €${cartSubtotal}`);
  console.log(`Free Shipping: ${freeShipping}`);

  // Modify delivery options: Keep only free shipping if Tags Matched and Order Value
  return {
    operations: input.cart.deliveryGroups.flatMap((group) =>
      group.deliveryOptions.map((option) =>
        freeShipping
          ? option.title.toLowerCase().includes("free")
            ? { rename: { deliveryOptionHandle: option.handle, title: "Complimentary Delivery" } }
            : { hide: { deliveryOptionHandle: option.handle } }
          : option.title.toLowerCase().includes("standard")
            ? { rename: { deliveryOptionHandle: option.handle, title: "Standard" } }
            : { hide: { deliveryOptionHandle: option.handle } }
      )
    ),
  };
  
}

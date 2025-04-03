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

  const cartAttributes = input.cart.attribute?.value;
  const customerBrandSource = cartAttributes || "guest";
  
  let freeShipping = false;

  if (customerBrandSource === "b2b") {
    freeShipping = true; // Free shipping for B2B from €0

  } else if (customerBrandSource === "lannoo_normal" && cartSubtotal >= 25) {
    freeShipping = true; // Free shipping for Lannoo Normal if order is above €25

  } else if (customerBrandSource === "lannoo_campus" && cartSubtotal >= 50) {
    freeShipping = true; // Free shipping for Lannoo Campus if order is above €50
  }

  console.log(`Customer Tags: ${customerTags}`);
  console.log(`Cart Subtotal: €${cartSubtotal}`);
  console.log(`Free Shipping: ${freeShipping}`);
  console.log(`Customer Brand Source Attribute Value: ${customerBrandSource}`);
  

  // Modify delivery options: Keep only free shipping if Tags Matched and Order Value
  return {
    operations: input.cart.deliveryGroups.flatMap((group) =>
      group.deliveryOptions.map((option) =>
        freeShipping
          ? option.title?.toLowerCase().includes("free")
            ? { rename: { deliveryOptionHandle: option.handle, title: "Complimentary Delivery" } }
            : { hide: { deliveryOptionHandle: option.handle } }
          : option.title?.toLowerCase().includes("standard")
            ? { rename: { deliveryOptionHandle: option.handle, title: "Standard" } }
            : { hide: { deliveryOptionHandle: option.handle } }
      )
    ),
  };
  
}

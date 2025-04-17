// @ts-check

import { DeliveryDiscountSelectionStrategy } from '../generated/api';

/**
 * @typedef {import("../generated/api").DeliveryInput} RunInput
 * @typedef {import("../generated/api").CartDeliveryOptionsDiscountsGenerateRunResult} CartDeliveryOptionsDiscountsGenerateRunResult
 */
/**
 * generateDeliveryRun
 * @param {RunInput} input - The DeliveryInput
 * @returns {CartDeliveryOptionsDiscountsGenerateRunResult} - The function result with discounts.
 */

const NO_OPERATIONS = {
    operations: []
};


export function generateDeliveryRun(input) {

    const customer = input.cart.buyerIdentity?.customer;

    // Skip if no customer
    if (!customer) {

        console.log("Shipping: Return if no customer");
        return NO_OPERATIONS;
    }

    const cartSubtotal = parseFloat(input.cart.cost.subtotalAmount.amount);

    const customerBrandSource = input.cart.customerBrandSource?.value;

    let freeShipping = false;
    let reasonForFreeShipping = null;

    if (customerBrandSource === "b2b") {
        // Free shipping for B2B from €0
        freeShipping = true;
        reasonForFreeShipping = "Sales Channel: b2b";

    } else if (customerBrandSource === "lannoo_normal" && cartSubtotal >= 25) {
        // Free shipping for Lannoo Normal if order is above €25
        freeShipping = true;
        reasonForFreeShipping = "Sales Channel: lannoo_normal (Subtotal ≥ €25)";

    } else if (customerBrandSource === "lannoo_campus" && cartSubtotal >= 50) {
        // Free shipping for Lannoo Campus if order is above €50
        freeShipping = true;
        reasonForFreeShipping = "Sales Channel: lannoo_campus (Subtotal ≥ €50)";
    }

    // Free Shipping based on FREE SAMPLE COPY if not Sales Channel
    if (!freeShipping) {

        const shippingRequiredLines = input.cart.lines.filter((line) => {

            const sample_copy_opted = line.sampleCopyOpted?.value === "true" ? true : false;

            console.log(
                "Product Name:", line.merchandise.product?.title,
                "| Requires Shipping:", line.merchandise?.requiresShipping,
                "| Sample Copy Opted Attribute:", sample_copy_opted
            );

            return line.merchandise?.__typename === "ProductVariant" &&
                line.merchandise?.requiresShipping === true;
        });

        const allShippingLinesOptedForSampleCopy = shippingRequiredLines.every(
            (line) => line.sampleCopyOpted?.value === "true"
        );

        // Skip if requires shipping product is non sample copy opted product
        if (!allShippingLinesOptedForSampleCopy) {

            console.log("Some shipping-required cart lines did NOT opt for sample copy.");
            return NO_OPERATIONS;
        }
        else {
            reasonForFreeShipping = "FREE SAMPLE COPY opted for all shippable lines";
        }
    }

    let standardOptionHandle = null;

    // Loop through all delivery groups and options
    input.cart.deliveryGroups.forEach((group) => {
        group.deliveryOptions.forEach((option) => {
            // console.log("Option title:", option.title);
            if (option.title?.toLowerCase() === "standard") {
                standardOptionHandle = option.handle;
            }
        });
    });

    if (!standardOptionHandle) {
        console.log("No 'Standard' delivery option found.");
        return NO_OPERATIONS;
    }

    console.log("Applied FREE Shipping cause of", reasonForFreeShipping);
    // console.log("Standard delivery option handle:", standardOptionHandle);

    return {
        operations: [
            {
                deliveryDiscountsAdd: {
                    candidates: [
                        {
                            message: `FREE DELIVERY by ${reasonForFreeShipping}`,
                            targets: [
                                {
                                    deliveryOption: {
                                        handle: standardOptionHandle
                                    }
                                },
                            ],
                            value: {
                                percentage: {
                                    value: 100,
                                },
                            },
                        },
                    ],
                    selectionStrategy: DeliveryDiscountSelectionStrategy.All,
                },
            },
        ],
    };
}
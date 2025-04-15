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

    let standardOptionHandle = null;

    const customer = input.cart.buyerIdentity?.customer;
    const sample_copy_opted = input.cart.attribute?.value === "true";

    // Skip if no customer or Cart Attribute False
    if (!customer || !sample_copy_opted) {
        console.log("Shipping: Return if no customer or Cart Attribute False");

        return NO_OPERATIONS;
    }

    const canCustomerOrderSample = customer.canOrderSamples?.value === "true";
    const customerSegment = customer.customerSegment?.value;
    const claimedFreeSampleCopyProductIds = customer.claimedFreeSampleCopyProductIds?.jsonValue || [];

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

            // console.log("New Discount on Product: ", isProductEligibleForDiscount);


            return isProductEligibleForDiscount;

        })
        .map((line) => {
            return {
                cartLine: {
                    id: line.id,
                    quantity: 1
                }
            };
        });

    // If no targets, return empty shipping discount
    if (targets.length > 0) {
        // Loop through all delivery groups and options
        input.cart.deliveryGroups.forEach((group) => {
            group.deliveryOptions.forEach((option) => {
                // console.log("Option title:", option.title);
                if (option.title?.toLowerCase() === "standard") {
                    standardOptionHandle = option.handle;
                }
            });
        });
    }
    else {
        console.log("Shipping: NO Operations as targets is 0");
        return NO_OPERATIONS;
    }

    if (!standardOptionHandle) {
        console.log("No 'Standard' delivery option found.");
        return NO_OPERATIONS;
    }

    // console.log("Standard delivery option handle:", standardOptionHandle);

    return {
        operations: [
            {
                deliveryDiscountsAdd: {
                    candidates: [
                        {
                            message: 'FREE DELIVERY',
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
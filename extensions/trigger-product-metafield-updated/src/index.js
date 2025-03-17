import { DeliveryMethod } from "@shopify/shopify-api";

export const setupAppExtension = async (api) => {
  // Register a webhook to listen for product updates
  const webhookRegistration = await api.webhooks.register({
    path: "/webhooks/products-update",
    topic: "PRODUCTS_UPDATE",
    deliveryMethod: DeliveryMethod.Http,
    webhookHandler: async (topic, shop, body) => {
      await handleProductUpdate(api, shop, body);
    },
  });
  
  console.log('Webhook registration result:', webhookRegistration);
};
export default async function handler(req, res) {
    try {
      const { body } = req;
      const shopify = res.locals.shopify;
      
      const productData = JSON.parse(body);
      const productId = productData.id;
      const gid = `gid://shopify/Product/${productId}`;
      
      const query = `
        query getProductMetafield($productId: ID!) {
          product(id: $productId) {
            id
            title
            metafield(namespace: "custom", key: "has_sample_copy") {
              value
              updatedAt
            }
          }
        }
      `;
      
      const response = await shopify.api.graphql({
        data: {
          query,
          variables: { productId: gid }
        }
      });
      
      const product = response.body.data.product;
      const metafield = product?.metafield;
      
      if (metafield) {
        const metafieldUpdatedAt = new Date(metafield.updatedAt);
        const now = new Date();
        const diffMiliSeconds = now - metafieldUpdatedAt;
        const diffMin = Math.round(diffMiliSeconds / 60000);
        
        if (diffMiliSeconds <= 1000) {
          const metafieldValue = metafield.value.toLowerCase() === 'true';
          
          const mutation = `
            mutation {
              flowTriggerReceive(
                handle: "trigger-product-updated",
                payload: {
                  "product_id": "${gid}"
                }
              ) {
                userErrors {
                  field
                  message
                }
              }
            }
          `;
          
          const triggerResponse = await shopify.api.graphql({
            data: { query: mutation }
          });
          
          console.log("Flow trigger result:", JSON.stringify(triggerResponse.body.data));
        }
      }
      
      res.status(200).send("Webhook processed");
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).send("Error processing webhook");
    }
  }
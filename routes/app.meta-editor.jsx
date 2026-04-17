import { useState } from "react"; 
import { useLoaderData, useFetcher } from "@remix-run/react"; 
import { authenticate } from "../shopify.server"; 
import { 
 Page, Layout, Card, TextField, Button, BlockStack, Text, Select 
} from "@shopify/polaris"; 
import { json } from "@remix-run/node"; 
 
export const loader = async ({ request }) => { 
const { admin } = await authenticate.admin(request); 
 const response = await admin.graphql(` 
   query { 
     products(first: 20) { 
       edges { 
         node { 
           id 
           title 
           seo { title description } 
         } 
       } 
     } 
   } 
 `); 
 const data = await response.json(); 
 return json({ products: data.data.products.edges.map(e => e.node) }); 
}; 
 
export const action = async ({ request }) => { 
 const { admin } = await authenticate.admin(request); 
 const formData = await request.formData(); 
 const productId = formData.get("productId"); 
 const seoTitle = formData.get("seoTitle"); 
 const seoDescription = formData.get("seoDescription"); 
 
 await admin.graphql(` 
   mutation updateProductSEO($input: ProductInput!) { 
     productUpdate(input: $input) { 
       product { 
         id 
         seo { title description } 
       } 
       userErrors { field message } 
     } 
   } 
 `, { 
   variables: { 
     input: { 
       id: productId, 
       seo: { title: seoTitle, description: seoDescription } 
     } 
   } 
 }); 
 
 return json({ success: true }); 
}; 
 
export default function MetaEditor() { 
 const { products } = useLoaderData(); 
 const fetcher = useFetcher(); 
 const [selectedProduct, setSelectedProduct] = useState(products[0]); 
 const [seoTitle, setSeoTitle] = useState(selectedProduct?.seo?.title || ""); 
 const [seoDesc, setSeoDesc] = useState(selectedProduct?.seo?.description || ""); 
 
 const productOptions = products.map(p => ({ label: p.title, value: p.id })); 
 
 const handleProductChange = (id) => { 
   const product = products.find(p => p.id === id); 
   setSelectedProduct(product); 
   setSeoTitle(product?.seo?.title || ""); 
   setSeoDesc(product?.seo?.description || ""); 
 }; 
 
 // Character count helpers 
 const titleStatus = seoTitle.length > 60 ? "Too long (max 60)" : `${seoTitle.length}/60`; 
 const descStatus = seoDesc.length > 160 ? "Too long (max 160)" : `${seoDesc.length}/160`; 
 
 return ( 
   <Page title="Meta Tags Editor"> 
     <Layout> 
       <Layout.Section> 
         <Card> 
           <BlockStack gap="400"> 
             <Select 
               label="Select Product" 
               options={productOptions} 
               onChange={handleProductChange} 
               value={selectedProduct?.id} 
             /> 
             <TextField 
               label={`SEO Title — ${titleStatus}`} 
               value={seoTitle} 
               onChange={setSeoTitle} 
               helpText="Recommended: 50-60 characters" 
               error={seoTitle.length > 60 ? "Title too long!" : ""} 
             /> 
             <TextField 
               label={`Meta Description — ${descStatus}`} 
               value={seoDesc} 
               onChange={setSeoDesc} 
               multiline={3} 
               helpText="Recommended: 150-160 characters" 
               error={seoDesc.length > 160 ? "Description too long!" : ""} 
             /> 
 
             {/* Google Preview */} 
             <Card background="bg-surface-secondary"> 
               <BlockStack gap="100"> 
                 <Text variant="headingSm">Google Preview</Text> 
                 <Text tone="success" variant="bodyMd">{seoTitle || "Your SEO Title"}</Text> 
                 <Text tone="subdued" variant="bodySm"> 
                   https://yourstore.com/products/{selectedProduct?.handle} 
                 </Text> 
                 <Text variant="bodySm">{seoDesc || "Your meta description will appear here..."}</Text> 
               </BlockStack> 
             </Card> 
 
             <fetcher.Form method="post"> 
               <input type="hidden" name="productId" value={selectedProduct?.id} /> 
               <input type="hidden" name="seoTitle" value={seoTitle} /> 
               <input type="hidden" name="seoDescription" value={seoDesc} /> 
               <Button submit variant="primary" loading={fetcher.state === "submitting"}> 
                 Save SEO Settings 
               </Button> 
             </fetcher.Form> 
 
             {fetcher.data?.success && ( 
               <Text tone="success">✅ SEO settings saved successfully!</Text> 
             )} 
           </BlockStack> 
         </Card> 
       </Layout.Section> 
     </Layout> 
   </Page> 
 ); 
} 
 

 

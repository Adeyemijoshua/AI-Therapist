import { Inngest } from "inngest";

// Initialize the Inngest client
export const inngest = new Inngest({
  id: "ai-therapy-agent",
  // You can add your Inngest signing key here if you have one
  eventKey:
    "signkey-test-49e0c3fa4ebabdbde3d4b235bd94e1f2a7a3071cf689fb03a5ae624244f5483e",
});

// Export the functions array (this will be populated by the functions.ts file)
export const functions: any[] = [];

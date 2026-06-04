import { createClient, OAuthStrategy, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';

let visitorClient: Awaited<ReturnType<typeof makeVisitor>> | null = null;
let readClientUnavailable = false;

async function makeVisitor() {
  const client = createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
  });
  const tokens = await client.auth.generateVisitorTokens();
  client.auth.setTokens(tokens);
  return client;
}

export async function getReadClient() {
  if (readClientUnavailable) return null;
  if (!visitorClient) visitorClient = await makeVisitor();
  return visitorClient;
}

export async function tryGetReadClient() {
  try {
    return await getReadClient();
  } catch (error) {
    readClientUnavailable = true;
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using local demo data because Wix is unavailable.', error);
      return null;
    }
    throw error;
  }
}

export function getAdminClient() {
  const { WIX_API_KEY, WIX_SITE_ID, WIX_ACCOUNT_ID } = process.env;
  if (!WIX_API_KEY || !WIX_SITE_ID) {
    throw new Error('WIX_API_KEY and WIX_SITE_ID required for admin client');
  }
  return createClient({
    modules: { items },
    auth: ApiKeyStrategy({ apiKey: WIX_API_KEY, siteId: WIX_SITE_ID, accountId: WIX_ACCOUNT_ID }),
  });
}

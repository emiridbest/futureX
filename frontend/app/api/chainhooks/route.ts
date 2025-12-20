import { NextResponse } from 'next/server';
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

export async function GET() {
  try {
    const client = new ChainhooksClient({
      baseUrl: CHAINHOOKS_BASE_URL.mainnet,
      apiKey: process.env.CHAINHOOKS_API_KEY,
    });

    // Check API status
    const status = await client.getStatus();
    // List all chainhooks
    const { results, total } = await client.getChainhooks({ limit: 50 });
    let firstChainhook = null;
    if (results.length > 0) {
      firstChainhook = await client.getChainhook(results[0].uuid);
    }
    return NextResponse.json({
      status: status.status,
      server_version: status.server_version,
      total,
      firstChainhook: firstChainhook ? firstChainhook.definition.name : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

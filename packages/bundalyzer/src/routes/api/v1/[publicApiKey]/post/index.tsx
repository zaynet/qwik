import { type RequestHandler } from '@builder.io/qwik-city';
import { getDB } from '../../../../../db';
import { symbolTable } from '../../../../../db/schema';
import { QSymbolBeaconPayload } from '../../../../../types/api/post-beacon';

export const onPost: RequestHandler = async ({ exit, json, request }) => {
  // console.log("API: POST: symbol");
  const payload = QSymbolBeaconPayload.parse(await request.json());
  exit();
  json(200, { code: 200, message: 'OK' });
  const db = getDB();
  let previousSymbol = payload.previousSymbol;
  const publicApiKey = payload.publicApiKey;
  const sessionID = payload.sessionID;
  for (const event of payload.symbols) {
    await db
      .insert(symbolTable)
      .values({
        publicApiKey,
        pathname: event.pathname,
        sessionID,
        previousSymbol: event.interaction || event.timeDelta > 250 ? null : previousSymbol,
        symbol: event.symbol,
        interaction: event.interaction ? 1 : 0,
        timeDelta: event.timeDelta,
      })
      .run();
    previousSymbol = event.symbol;
  }
};

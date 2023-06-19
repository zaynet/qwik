import { type RequestHandler } from '@builder.io/qwik-city';
import { initializeDbIfNeeded } from '../db';
import { connectRemoteLibsSqlDB } from '../db/remote-libsql';

export const onRequest: RequestHandler = async ({ env }) => {
  initializeDbIfNeeded(
    async () =>
      await connectRemoteLibsSqlDB({
        url: env.get('PRIVATE_LIBSQL_DB_URL')!,
        authToken: env.get('PRIVATE_LIBSQL_DB_API_TOKEN')!,
      })
  );
};

/**
 * PUBLIC API - Change with backwards compatibility in mind.
 */

import { z } from 'zod';

export interface QSymbolBeaconPayload {
  /**
   * Unique ID per user session.
   *
   * Every page refresh constitutes a new SessionID.
   * An SPA navigation will generate a new SessionID.
   * NOTE: A user session implies same route URL.
   */
  sessionID: string;
  /**
   * API key of the application which we are trying to profile.
   *
   * This key can be used for sharding the data.
   */
  publicApiKey: string;

  /**
   * Previous symbol received on the client.
   *
   * Client periodically sends symbol log to the server. Being able to connect the order
   * of symbols is useful for server clustering. Sending previous symbol name allows the
   * server to stitch the symbol list together.
   */
  previousSymbol: string | null;

  /**
   * List of symbols which have been received since last update.
   */
  symbols: QSymbolBeacon[];
}

export interface QSymbolBeacon {
  /**
   * Symbol name
   */
  symbol: string;
  /**
   * Time delta since last symbol. Can be used to stich symbol requests together
   */
  timeDelta: number;
  /**
   * Current pathname of location. Used to cluster by route.
   */
  pathname: string;

  /**
   * Was this symbol as a result of user interaction. User interactions represent roots for clouters.
   */
  interaction: boolean;
}

export const QSymbolBeacon = z.object({
  symbol: z.string(),
  timeDelta: z.number(),
  pathname: z.string(),
  interaction: z.boolean(),
});

export const QSymbolBeaconPayload = z.object({
  sessionID: z.string(),
  publicApiKey: z.string(),
  previousSymbol: z.string().nullable(),
  symbols: z.array(QSymbolBeacon),
});

QSymbolBeacon._type satisfies QSymbolBeacon;
QSymbolBeaconPayload._type satisfies QSymbolBeaconPayload;

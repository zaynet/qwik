import { routeAction$, routeLoader$, useLocation } from "@builder.io/qwik-city";
import { component$ } from "@builder.io/qwik";
import { getDB } from "~/db";
import { symbolTable } from "~/db/schema";
import { eq } from "drizzle-orm";

interface RouteInfo {
  route: string;
  count: number;
  symbols: SymbolInfo[];
}

interface SymbolInfo {
  name: string;
  routes: string[];
  interaction: boolean;
  children: SymbolInfo[];
  count: number;
}

export const useRawTable = routeLoader$(async ({ params }) => {
  const db = getDB();
  const symbolRows = await db
    .select()
    .from(symbolTable)
    .where(eq(symbolTable.publicApiKey, params.publicApiKey))
    .all();
  return symbolRows;
});

export const useRouteInfo = routeLoader$(async ({ params }) => {
  const db = getDB();
  const symbolRows = await db
    .select()
    .from(symbolTable)
    .where(eq(symbolTable.publicApiKey, params.publicApiKey))
    .all();
  const symbolMap = new Map<string, SymbolInfo>();
  const roots: Set<SymbolInfo> = new Set();
  for (const row of symbolRows) {
    const symbolInfo = getSymbol(row.symbol);
    symbolInfo.count++;
    if (row.interaction > 0) symbolInfo.interaction = true;
    ensureHas(symbolInfo.routes, row.pathname);
    if (row.previousSymbol) {
      ensureHas(getSymbol(row.previousSymbol).children, symbolInfo);
    } else {
      roots.add(symbolInfo);
    }
  }
  const routeMap = new Map<string, RouteInfo>();
  roots.forEach((symbolInfo) => {
    symbolInfo.routes.sort();
    const routeInfo = getRoute(symbolInfo.routes.join(""));
    ensureHas(routeInfo.symbols, symbolInfo);
  });

  const sessions: Map<RouteInfo, Set<string>> = new Map();
  for (const row of symbolRows) {
    const symbol = getSymbol(row.symbol);
    const routeInfo = getRoute(symbol.routes.join(""));
    const existingSessions = getExistingSessions(routeInfo);
    existingSessions.add(row.sessionID);
    routeInfo.count++;
  }

  const keys = Array.from(routeMap.keys());
  keys.sort();
  return keys.map((key) => {
    const routeInfo = routeMap.get(key)!;
    routeInfo.count = getExistingSessions(routeInfo).size;
    routeInfo.symbols.sort((a, b) => b.count - a.count);
    return routeInfo;
  });

  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////

  function getExistingSessions(routeInfo: RouteInfo) {
    let existingSessions = sessions.get(routeInfo);
    if (!existingSessions) {
      existingSessions = new Set<string>();
      sessions.set(routeInfo, existingSessions);
    }
    return existingSessions;
  }

  function getRoute(pathname: string): RouteInfo {
    let routeInfo = routeMap.get(pathname);
    if (!routeInfo) {
      routeInfo = {
        route: pathname,
        symbols: [],
        count: 0,
      };
      routeMap.set(pathname, routeInfo);
    }
    return routeInfo;
  }

  function getSymbol(name: string) {
    let symbolInfo = symbolMap.get(name);
    if (!symbolInfo) {
      symbolInfo = {
        name: name,
        routes: [],
        interaction: false,
        children: [],
        count: 0,
      };
      symbolMap.set(name, symbolInfo);
    }
    return symbolInfo;
  }
  function ensureHas<T>(array: T[], value: T) {
    if (!array.includes(value)) {
      array.push(value);
    }
  }
});

export const usePurgeRouteDataAction = routeAction$(
  async (_, { params, redirect, url }) => {
    const db = getDB();
    const response = await db
      .delete(symbolTable)
      .where(eq(symbolTable.publicApiKey, params.publicApiKey))
      .run();
    console.log(response);
    url.searchParams.delete("qaction");
    throw redirect(308, url.toString());
  }
);

export default component$(() => {
  const routes = useRouteInfo();
  const location = useLocation();
  const purgeRouteDataAction = usePurgeRouteDataAction();
  return (
    <div>
      <h1>Routes</h1>
      <form action={purgeRouteDataAction.actionPath} method="POST">
        <button>purge</button>
      </form>
      <ul>
        {routes.value.map((route, idx) => (
          <li key={idx}>
            <h2>
              <code>
                {route.route} ({route.count})
              </code>
            </h2>
            <ul>
              {route.symbols.map((symbol, idx) => (
                <Symbol
                  key={idx}
                  symbol={symbol}
                  total={route.count}
                  stack={[]}
                />
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <a href={`/app/${location.params.publicApiKey}`}>application</a>
      <RawTable />
    </div>
  );
});

export const Symbol = component$<{
  symbol: SymbolInfo;
  total: number;
  stack: SymbolInfo[];
}>(({ symbol, total, stack }) => {
  return (
    <li>
      {symbol.interaction && "👆"} {symbol.name} ({percent(symbol.count, total)}
      )
      {symbol.children && (
        <ul>
          {symbol.children.map((child, idx) =>
            stack.includes(symbol) ? (
              <span key={-idx}>(circular)</span>
            ) : (
              <Symbol
                key={idx}
                symbol={child}
                total={total}
                stack={[...stack, symbol]}
              />
            )
          )}
        </ul>
      )}
    </li>
  );
});

export const RawTable = component$(() => {
  const table = useRawTable();
  return (
    <table>
      <tbody>
        <tr>
          <th>SessionID</th>
          <th>pathname</th>
          <th>interaction</th>
          <th>previousSymbol</th>
          <th>symbol</th>
          <th>timeDelta</th>
        </tr>
        {table.value.map((row) => (
          <tr key={row.id}>
            <td>{row.sessionID}</td>
            <td>{row.pathname}</td>
            <td>{row.interaction}</td>
            <td>{row.previousSymbol}</td>
            <td>{row.symbol}</td>
            <td>{row.timeDelta}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});

function percent(numerator: number, denominator: number) {
  return Math.round((100 * numerator) / denominator) + "%";
}

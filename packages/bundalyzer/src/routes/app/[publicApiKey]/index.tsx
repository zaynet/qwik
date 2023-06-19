import { component$ } from "@builder.io/qwik";
import { routeLoader$, useLocation } from "@builder.io/qwik-city";
import { getDB } from "../../../db";
import { applicationTable } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const useApplication = routeLoader$(async ({ params }) => {
  const db = getDB();
  const application = await db
    .select()
    .from(applicationTable)
    .where(eq(applicationTable.publicApiKey, params.publicApiKey))
    .all();
  return application[0];
});

export default component$(() => {
  const application = useApplication();
  const location = useLocation();
  return (
    <div>
      <h1>{application.value.name}</h1>
      <p>{application.value.description}</p>
      <label>Public API key:</label>
      <code>{application.value.publicApiKey}</code>
      <ul>
        <li>
          <a href={`/app/${location.params.publicApiKey}/routes`}>routes</a>
        </li>
      </ul>
    </div>
  );
});

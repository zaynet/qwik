import { component$ } from "@builder.io/qwik";
import { routeAction$, zod$ } from "@builder.io/qwik-city";

// This is TypeScript type validation test only. It does not actually run.

type SimpleObject = { value: number; optional?: string };

export const useSimpleObjectAction = routeAction$(async () => {
  return { value: 42 } as SimpleObject;
});

export const useZodObjectAction = routeAction$(async () => {
  return { value: 42 } as SimpleObject;
}, zod$({}));

export default component$(() => {
  const fooAction = useSimpleObjectAction();
  fooAction.value! satisfies SimpleObject;
  //

  const fooZodAction = useZodObjectAction();
  if (fooZodAction.value?.failed) {
    fooZodAction.value! satisfies {
      formErrors: string[];
      fieldErrors: {};
      failed: true;
      value?: undefined;
      optional?: undefined;
    };
  } else {
    fooZodAction.value! satisfies SimpleObject;
  }
  return <>TEST</>;
});

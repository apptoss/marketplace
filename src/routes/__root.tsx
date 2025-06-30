import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { referralSearchSchema } from "@/referral/search"

// To add more search params, you can create additional schemas and merge them.
// Example: const anotherSchema = z.object({ param: z.string() });
// const rootSearchSchema = referralSearchSchema.merge(anotherSchema);
const rootSearchSchema = referralSearchSchema

export const Route = createRootRoute({
	validateSearch: rootSearchSchema,
	component: () => (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	),
})

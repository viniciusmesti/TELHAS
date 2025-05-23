declare module "@hookform/resolvers/zod" {
    import type { ZodSchema } from "zod"
    import type { Resolver } from "react-hook-form"
  
    export function zodResolver<T>(schema: ZodSchema<T>): Resolver<T>
  }
  
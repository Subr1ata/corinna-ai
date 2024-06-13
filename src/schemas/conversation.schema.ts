import { ZodType, z } from "zod";

export type ConversationSearchProps = {
    query: string
    domain: string
}

export const ConversationSearchSchema: ZodType<ConversationSearchProps> = z.object({
    query: z.string().min(1, { message: 'You must entry a search query' }),
    domain: z.string().min(1, { message: 'You must select a domain' })
})
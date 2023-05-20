import { z } from "zod";
import { OpenAIApi, Configuration } from 'openai'
import { env } from "~/env.mjs";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";


const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {

      console.log(input.text);

      const result = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
          role: "system",
          content: "You are specialized for generating and editing code and writing documentation. You prioritize compactness and readability. Answer with only the code in Markdown code blocks. You are a very powerful and efficient tool for developers.",
        },
        {
          role: "user",
          content: "controller method spring boot",
        },
        {
          role: "assistant",
          content: "```java\n@GetMapping(\"/hello\")\npublic String hello() {\n    return \"Hello, World!\";\n}\n```",
        },
        {
          role: "user",
          content: input.text,
        }],
        n: 1,
        max_tokens: 500,
      });

      // for ( const c of result.data.choices ) {
      //   console.log(c.message?.role);
      //   console.log(c.message?.content);
      // }

      return {
        greeting: result.data.choices[0]?.message?.content,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

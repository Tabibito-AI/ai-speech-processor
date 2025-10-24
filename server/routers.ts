import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { translateWithManusLLM, summarizeWithManusLLM } from "./llm";
import { transcribeAudioWithDeepgram } from "./transcription";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Audio processing routers
  audio: router({
    translate: publicProcedure
      .input(
        z.object({
          text: z.string().min(1, "Text is required"),
          targetLanguage: z.string().default("en"),
          previousTranslations: z.array(z.string()).default([]),
          originalContext: z.string().default(""),
        })
      )
      .mutation(async ({ input }) => {
        try {
          console.log(
            `[TRANSLATION] Request received: text='${input.text.substring(0, 50)}...', target_language=${input.targetLanguage}`
          );

          const translatedText = await translateWithManusLLM(
            input.text,
            input.targetLanguage,
            input.previousTranslations,
            input.originalContext
          );

          console.log(
            `[TRANSLATION] Success: '${translatedText.substring(0, 50)}...'`
          );
          return { translation: translatedText };
        } catch (error) {
          console.error("[TRANSLATION_ERROR]", error);
          throw new Error(
            `Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }),

    summarize: publicProcedure
      .input(
        z.object({
          transcript: z.string().min(1, "Transcript is required"),
          summaryType: z
            .enum(["short", "medium", "detailed"])
            .default("medium"),
          summaryLanguage: z.string().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          console.log(
            `[SUMMARIZE] Request received: type=${input.summaryType}, language=${input.summaryLanguage}`
          );

          const summary = await summarizeWithManusLLM(
            input.transcript,
            input.summaryType,
            input.summaryLanguage
          );

          console.log(
            `[SUMMARIZE] Success: '${summary.substring(0, 50)}...'`
          );
          return { summary, summaryType: input.summaryType };
        } catch (error) {
          console.error("[SUMMARIZE_ERROR]", error);
          throw new Error(
            `Summarization failed: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }),

    transcribe: publicProcedure
      .input(
        z.object({
          audioData: z.string(), // Base64 encoded audio data
          language: z.string().default("ja"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          console.log(
            `[TRANSCRIBE] Request received: language=${input.language}`
          );

          // Decode base64 audio data
          const audioBuffer = Buffer.from(input.audioData, "base64");
          console.log(
            `[TRANSCRIBE] Audio buffer size: ${audioBuffer.length} bytes`
          );

          const transcription = await transcribeAudioWithDeepgram(
            audioBuffer,
            input.language
          );

          if (!transcription) {
            throw new Error("Failed to transcribe audio");
          }

          console.log(
            `[TRANSCRIBE] Success: '${transcription.substring(0, 50)}...'`
          );
          return { transcription };
        } catch (error) {
          console.error("[TRANSCRIBE_ERROR]", error);
          throw new Error(
            `Transcription failed: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

import { z } from "zod";
import { STATUSES } from "../config/checklistTemplate.js";

export const createRelocationSchema = z
  .object({
    customerName: z.string().trim().min(1, "Customer name is required").max(120),
    customerPhone: z.string().trim().max(30).optional().or(z.literal("")),
    originCity: z.string().trim().min(1, "Origin city is required"),
    destCity: z.string().trim().min(1, "Destination city is required"),
    moveDate: z
      .string()
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Move date is invalid"),
    opsOwner: z.string().trim().min(1, "Ops owner is required"),
  })
  .refine((data) => data.originCity.toLowerCase() !== data.destCity.toLowerCase(), {
    message: "Origin and destination city cannot be the same",
    path: ["destCity"],
  });

export const updateChecklistItemSchema = z.object({
  status: z.enum(STATUSES),
  note: z.string().max(500).optional(),
  updatedBy: z.string().max(120).optional(),
});

export const parseUpdateSchema = z.object({
  text: z.string().trim().min(1, "Update text is required").max(4000),
});

export const applySuggestionsSchema = z.object({
  suggestions: z
    .array(
      z.object({
        key: z.string(),
        status: z.enum(STATUSES),
        note: z.string().max(200).optional().default(""),
      })
    )
    .min(1),
  updatedBy: z.string().max(120).optional(),
});

export const aiSuggestionArraySchema = z.array(
  z.object({
    key: z.string(),
    status: z.enum(STATUSES),
    note: z.string().max(200).optional().default(""),
  })
);

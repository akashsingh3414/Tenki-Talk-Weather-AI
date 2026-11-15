import { z } from "zod";

export const travelPlaceSchema = z.object({
    day: z.number().optional().describe("Day number of the trip (e.g., 1, 2)"),
    timeOfDay: z.enum(["Morning", "Afternoon", "Evening", "Night"]).optional().describe("Broad time of day for the activity"),
    name: z.string().describe("The official, exact name of the landmark, restaurant, or site"),
    description: z.string().describe("What the place is famous for and its cultural/historical significance"),
    suitability: z.string().optional().describe("3-4 sentence justification based specifically on current weather"),
    weatherMatch: z.string().optional().describe("A short dynamic catchy tag like 'Perfect for a Rainy Morning'"),
    visitDuration: z.string().optional().describe("Estimated time to spend at the location"),
    travelTip: z.string().optional().describe("Practical tip"),
    details: z.string().optional().describe("What to see, activities, gear"),
    imageSearchQuery: z.string().optional().describe("3-4 keywords for image search"),
    website: z.string().url().optional().or(z.literal("")).describe("Official website"),
    mapsUrl: z.string().optional().describe("Direct Google Maps search URL"),
});

export const travelPlanSchema = z.object({
    explanation: z.string().describe("A 5-6 sentence weather-aware introduction for the trip, mentioning temp, humidity, and how they affect the day's plans"),
    places: z.array(travelPlaceSchema).describe("List of pinpoint locations recommended for the trip"),
    closing: z.string().optional().describe("A warm, weather-aware closing with final advice or clothing tips"),
});

export type TravelPlan = z.infer<typeof travelPlanSchema>;
export type TravelPlace = z.infer<typeof travelPlaceSchema>;

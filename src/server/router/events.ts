import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { replaceTime, roundHourDown } from "../utils/dateTimeModifers";
import { createRouter } from "./context";
import { findFutureDates } from "../utils/findFutureDates";
import Roles from "../../pages/roles";

export const eventsRouter = createRouter()
	.query("getUpcomingEventsByOrganization", {
		async resolve({ ctx }) {
			const org = await prisma?.user.findFirst({
				where: { id: ctx.session?.user.id },
				select: { organizationId: true },
			});
			return await prisma?.event.findMany({
				where: {
					organizationId: org?.organizationId,
					datetime: {
						gte: roundHourDown(),
					},
				},
				include: {
					positions: {
						include: {
							Role: true,
							User: true,
						},
					},
				},
				orderBy: {
					datetime: "asc",
				},
			});
		},
	})
	.query("getPastEventsByOrganization", {
		async resolve({ ctx }) {
			const org = await prisma?.user.findFirst({
				where: { id: ctx.session?.user.id },
				select: { organizationId: true },
			});
			return await prisma?.event.findMany({
				where: {
					organizationId: org?.organizationId,
					datetime: {
						lt: roundHourDown(),
					},
				},
				include: {
					positions: {
						include: {
							Role: true,
						},
					},
				},
				orderBy: {
					datetime: "desc",
				},
			});
		},
	})
	.query("getEventById", {
		input: z.string(),
		async resolve({ input }) {
			return await prisma?.event.findFirst({
				where: { id: input },
				include: {
					Locations: true,
					positions: {
						include: { Role: true },
					},
				},
			});
		},
	})
	.middleware(async ({ ctx, next }) => {
		const user = await prisma?.user.findFirst({
			where: { id: ctx.session?.user.id },
			select: {
				status: true,
			},
		});
		if (user?.status != "ADMIN") {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}
		return next();
	})
	.mutation("createEvent", {
		input: z.object({
			name: z.string(),
			eventDate: z.date(),
			eventTime: z.date(),
			recurringId: z.string().optional(),
			eventLocation: z.object({
				id: z.string(),
				name: z.string(),
				organizationId: z.string(),
			}),
			positions: z
				.object({
					position: z.object({
						id: z.string(),
						name: z.string(),
						organizationId: z.string().optional(),
					}),
					quantity: z.number(),
				})
				.array(),
		}),

		async resolve({ ctx, input }) {
			const org = await prisma?.user.findFirst({
				where: { id: ctx.session?.user.id },
				select: { organizationId: true },
			});

			return await prisma?.event.create({
				data: {
					name: input.name,
					recurringId: input?.recurringId,
					datetime: replaceTime(input.eventDate, input.eventTime),
					organizationId: org?.organizationId,
					locationsId: input.eventLocation.id,
					positions: {
						create: input.positions.map((item) => ({
							roleId: item.position.id,
						})),
					},
				},
			});
		},
	})
	.mutation("editEvent", {
		input: z.object({
			id: z.string(),
			name: z.string(),
			eventDate: z.date(),
			eventTime: z.date(),
			organization: z.string(),
			recurringId: z.string().optional(),
			eventLocation: z.object({
				id: z.string(),
				name: z.string(),
				organizationId: z.string(),
			}),
			positions: z
				.object({
					position: z.object({
						id: z.string(),
						name: z.string(),
						organizationId: z.string().optional(),
					}),
					quantity: z.number(),
				})
				.array(),
		}),

		async resolve({ ctx, input }) {
			//deletes all connected positions that are not
			await prisma?.eventPositions.deleteMany({
				where: {
					eventId: input.id,
				},
			});

			const event = await prisma?.event.update({
				data: {
					name: input.name,
					recurringId: input?.recurringId,
					datetime: replaceTime(input.eventDate, input.eventTime),
					organizationId: input.organization,
					locationsId: input.eventLocation.id,
					positions: {
						connectOrCreate: input.positions.map((position) => ({
							roleId: position.position.id,
						})),
					},
				},
				where: {
					id: input.id,
				},
			});
		},
	})
	.mutation("deleteEventById", {
		input: z.string(),
		async resolve({ input }) {
			return await prisma?.event.delete({
				where: {
					id: input,
				},
			});
		},
	});

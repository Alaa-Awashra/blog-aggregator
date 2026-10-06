import { desc, eq } from "drizzle-orm";

import { db } from "../index.js";
import {
  posts,
  feeds,
  feedFollows,
} from "../schema.js";

export async function createPost(data: {
  title: string;
  url: string;
  description?: string | null;
  publishedAt?: Date | null;
  feedId: string;
}) {
  const [result] = await db
    .insert(posts)
    .values({
      title: data.title,
      url: data.url,
      description: data.description ?? null,
      publishedAt: data.publishedAt ?? null,
      feedId: data.feedId,
    })
    .onConflictDoNothing({
      target: posts.url,
    })
    .returning();

  return result;
}

export async function getPostsForUser(
  userId: string,
  limit: number
) {
  return await db
    .select({
      id: posts.id,
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
      feedId: posts.feedId,
      feedName: feeds.name,
    })
    .from(posts)
    .innerJoin(
      feedFollows,
      eq(posts.feedId, feedFollows.feedId)
    )
    .innerJoin(
      feeds,
      eq(posts.feedId, feeds.id)
    )
    .where(
      eq(feedFollows.userId, userId)
    )
    .orderBy(
      desc(posts.publishedAt),
      desc(posts.createdAt)
    )
    .limit(limit);
}

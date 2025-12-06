import { prisma } from "./prismaClient";
import { JSONScalar } from "./utils/jsonScalar";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 從上下文獲取當前用戶
interface Context {
  userId?: number;
}

const getUserFromContext = async (context: Context) => {
  if (!context.userId) return null;
  return await prisma.user.findUnique({ where: { id: context.userId } });
};

// 假數據（當資料庫未配置時使用）
const mockCategories = [
  { id: 1, name: '綜合討論', slug: 'general', description: '遊戲綜合討論區', icon: '💬', color: '#c9a227', order: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), postCount: 3 },
  { id: 2, name: '攻略分享', slug: 'guides', description: '遊戲攻略與心得', icon: '📖', color: '#e91e63', order: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), postCount: 2 },
  { id: 3, name: 'Bug 回報', slug: 'bugs', description: '遊戲問題回報', icon: '🐛', color: '#f44336', order: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), postCount: 1 },
];

const mockPosts = [
  {
    id: 1,
    title: '歡迎來到 Kingdoms 論壇！',
    slug: 'welcome-to-kingdoms',
    content: '<p>歡迎來到 Kingdoms 官方論壇！</p><p>在這裡你可以：</p><ul><li>討論遊戲內容</li><li>分享遊戲攻略</li><li>回報遊戲問題</li><li>結交志同道合的玩家</li></ul>',
    excerpt: '歡迎使用 Kingdoms 官方論壇！',
    author: 'Admin',
    authorEmail: 'admin@kingdoms.com',
    views: 100,
    isPinned: true,
    isLocked: false,
    categoryId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    commentCount: 0,
  },
];

const mockAnnouncements = [
  {
    id: 1,
    title: '遊戲即將開放測試！',
    slug: 'game-beta-test',
    content: '<p>親愛的玩家們：</p><p>我們很高興地宣布，Kingdoms 即將開放封閉測試！敬請期待更多消息。</p>',
    excerpt: 'Kingdoms 即將開放封閉測試！',
    type: 'general',
    isPinned: true,
    isPublished: true,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: '更新公告 v0.1.0',
    slug: 'update-v0-1-0',
    content: '<p>本次更新內容：</p><ul><li>新增遊戲功能</li><li>修復已知問題</li><li>優化遊戲體驗</li></ul>',
    excerpt: '查看 v0.1.0 版本更新內容',
    type: 'update',
    isPinned: false,
    isPublished: true,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Category Resolvers
const CategoryResolvers = {
  Query: {
    categories: async () => {
      try {
        const categories = await prisma.category.findMany({
          orderBy: { order: 'asc' },
        });
        return categories.map((cat) => ({
          ...cat,
          postCount: 0,
        }));
      } catch (error) {
        console.warn('資料庫未配置，使用假數據');
        return mockCategories;
      }
    },
    category: async (_: unknown, { id, slug }: { id?: number; slug?: string }) => {
      if (id) {
        return await prisma.category.findUnique({ where: { id } });
      }
      if (slug) {
        return await prisma.category.findUnique({ where: { slug } });
      }
      throw new Error('必須提供 id 或 slug');
    },
  },
  Mutation: {
    createCategory: async (_: unknown, { input }: { input: { name: string; slug: string; description?: string; icon?: string; color?: string; order?: number } }) => {
      return await prisma.category.create({
        data: {
          name: input.name,
          slug: input.slug,
          description: input.description,
          icon: input.icon,
          color: input.color || '#c9a227',
          order: input.order || 0,
        },
      });
    },
    updateCategory: async (_: unknown, { id, input }: { id: number; input: { name?: string; slug?: string; description?: string; icon?: string; color?: string; order?: number } }) => {
      return await prisma.category.update({
        where: { id },
        data: input,
      });
    },
    deleteCategory: async (_: unknown, { id }: { id: number }) => {
      await prisma.category.delete({ where: { id } });
      return true;
    },
  },
  Category: {
    postCount: async (parent: { id: number; postCount?: number }) => {
      if (parent.postCount !== undefined) {
        return parent.postCount;
      }
      try {
        return await prisma.post.count({ where: { categoryId: parent.id } });
      } catch {
        return 0;
      }
    },
  },
};

// Post Resolvers
const PostResolvers = {
  Query: {
    posts: async (_: unknown, { page = 1, pageSize = 20, categoryId, search }: { page?: number; pageSize?: number; categoryId?: number; search?: string }) => {
      try {
        const where: { categoryId?: number; OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { content: { contains: string; mode: 'insensitive' } }> } = {};

        if (categoryId) {
          where.categoryId = categoryId;
        }

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ];
        }

        const total = await prisma.post.count({ where });
        const posts = await prisma.post.findMany({
          where,
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: { category: true },
        });

        return {
          posts,
          total,
          page,
          pageSize,
          hasMore: total > page * pageSize,
        };
      } catch (error) {
        console.warn('資料庫未配置，使用假數據');
        const filteredPosts = mockPosts
          .filter(p => !categoryId || p.categoryId === categoryId)
          .map(p => ({
            ...p,
            category: mockCategories.find(c => c.id === p.categoryId)!,
          }));

        return {
          posts: filteredPosts,
          total: filteredPosts.length,
          page: 1,
          pageSize: 20,
          hasMore: false,
        };
      }
    },
    post: async (_: unknown, { id, slug }: { id?: number; slug?: string }) => {
      if (id) {
        return await prisma.post.findUnique({
          where: { id },
          include: { category: true },
        });
      }
      if (slug) {
        return await prisma.post.findUnique({
          where: { slug },
          include: { category: true },
        });
      }
      throw new Error('必須提供 id 或 slug');
    },
    pinnedPosts: async () => {
      try {
        return await prisma.post.findMany({
          where: { isPinned: true },
          orderBy: { createdAt: 'desc' },
          include: { category: true },
        });
      } catch {
        return mockPosts
          .filter(p => p.isPinned)
          .map(p => ({
            ...p,
            category: mockCategories.find(c => c.id === p.categoryId)!,
          }));
      }
    },
  },
  Mutation: {
    createPost: async (_: unknown, { input }: { input: { title: string; slug: string; content: string; excerpt?: string; author: string; authorEmail?: string; coverImage?: string; categoryId: number; isPinned?: boolean; isLocked?: boolean } }) => {
      return await prisma.post.create({
        data: input,
        include: { category: true },
      });
    },
    updatePost: async (_: unknown, { id, input }: { id: number; input: { title?: string; slug?: string; content?: string; excerpt?: string; author?: string; authorEmail?: string; coverImage?: string; categoryId?: number; isPinned?: boolean; isLocked?: boolean } }) => {
      return await prisma.post.update({
        where: { id },
        data: input,
        include: { category: true },
      });
    },
    deletePost: async (_: unknown, { id }: { id: number }) => {
      await prisma.post.delete({ where: { id } });
      return true;
    },
    incrementPostViews: async (_: unknown, { id }: { id: number }) => {
      return await prisma.post.update({
        where: { id },
        data: { views: { increment: 1 } },
        include: { category: true },
      });
    },
  },
  Post: {
    commentCount: async (parent: { id: number; commentCount?: number }) => {
      if (parent.commentCount !== undefined) {
        return parent.commentCount;
      }
      try {
        return await prisma.comment.count({ where: { postId: parent.id } });
      } catch {
        return 0;
      }
    },
  },
};

// Comment Resolvers
const CommentResolvers = {
  Query: {
    comments: async (_: unknown, { postId }: { postId: number }) => {
      return await prisma.comment.findMany({
        where: { postId, parentId: null },
        orderBy: { createdAt: 'desc' },
        include: {
          replies: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    },
  },
  Mutation: {
    createComment: async (_: unknown, { input }: { input: { content: string; author: string; authorEmail?: string; postId: number; parentId?: number } }) => {
      return await prisma.comment.create({
        data: input,
        include: { replies: true },
      });
    },
    updateComment: async (_: unknown, { id, input }: { id: number; input: { content?: string } }) => {
      return await prisma.comment.update({
        where: { id },
        data: input,
        include: { replies: true },
      });
    },
    deleteComment: async (_: unknown, { id }: { id: number }) => {
      await prisma.comment.delete({ where: { id } });
      return true;
    },
  },
};

// Announcement Resolvers
const AnnouncementResolvers = {
  Query: {
    announcements: async (_: unknown, { page = 1, pageSize = 20, type }: { page?: number; pageSize?: number; type?: string }) => {
      try {
        const where: { type?: string; isPublished: boolean } = { isPublished: true };

        if (type) {
          where.type = type;
        }

        const total = await prisma.announcement.count({ where });
        const announcements = await prisma.announcement.findMany({
          where,
          orderBy: [
            { isPinned: 'desc' },
            { publishedAt: 'desc' },
          ],
          skip: (page - 1) * pageSize,
          take: pageSize,
        });

        return {
          announcements,
          total,
          page,
          pageSize,
          hasMore: total > page * pageSize,
        };
      } catch (error) {
        console.warn('資料庫未配置，使用假數據');
        const filtered = mockAnnouncements.filter(a => !type || a.type === type);
        return {
          announcements: filtered,
          total: filtered.length,
          page: 1,
          pageSize: 20,
          hasMore: false,
        };
      }
    },
    announcement: async (_: unknown, { id, slug }: { id?: number; slug?: string }) => {
      if (id) {
        return await prisma.announcement.findUnique({ where: { id } });
      }
      if (slug) {
        return await prisma.announcement.findUnique({ where: { slug } });
      }
      throw new Error('必須提供 id 或 slug');
    },
    pinnedAnnouncements: async () => {
      try {
        return await prisma.announcement.findMany({
          where: { isPinned: true, isPublished: true },
          orderBy: { publishedAt: 'desc' },
        });
      } catch {
        return mockAnnouncements.filter(a => a.isPinned);
      }
    },
    latestAnnouncements: async (_: unknown, { limit = 5 }: { limit?: number }) => {
      try {
        return await prisma.announcement.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: limit,
        });
      } catch {
        return mockAnnouncements.slice(0, limit);
      }
    },
  },
  Mutation: {
    createAnnouncement: async (_: unknown, { input }: { input: { title: string; slug: string; content: string; excerpt?: string; coverImage?: string; type?: string; isPinned?: boolean; isPublished?: boolean } }) => {
      try {
        return await prisma.announcement.create({
          data: {
            ...input,
            type: input.type || 'general',
          },
        });
      } catch (error) {
        console.error('createAnnouncement error:', error);
        throw error;
      }
    },
    updateAnnouncement: async (_: unknown, { id, input }: { id: number; input: { title?: string; slug?: string; content?: string; excerpt?: string; coverImage?: string; type?: string; isPinned?: boolean; isPublished?: boolean } }) => {
      return await prisma.announcement.update({
        where: { id },
        data: input,
      });
    },
    deleteAnnouncement: async (_: unknown, { id }: { id: number }) => {
      await prisma.announcement.delete({ where: { id } });
      return true;
    },
  },
};

// Dashboard Stats Resolver
const DashboardResolvers = {
  Query: {
    dashboardStats: async () => {
      try {
        const [announcementCount, postCount, categoryCount, totalViews] = await Promise.all([
          prisma.announcement.count(),
          prisma.post.count(),
          prisma.category.count(),
          prisma.post.aggregate({ _sum: { views: true } }),
        ]);

        return {
          announcementCount,
          postCount,
          categoryCount,
          totalViews: totalViews._sum.views || 0,
        };
      } catch (error) {
        console.warn('資料庫未配置，使用假數據');
        return {
          announcementCount: mockAnnouncements.length,
          postCount: mockPosts.length,
          categoryCount: mockCategories.length,
          totalViews: 100,
        };
      }
    },
  },
};

// ContentBlock Resolvers
const ContentBlockResolvers = {
  Query: {
    contentBlocks: async () => {
      try {
        return await prisma.contentBlock.findMany({
          orderBy: { key: 'asc' },
        });
      } catch (error) {
        console.warn('資料庫未配置，使用空數據');
        return [];
      }
    },
    contentBlock: async (_: unknown, { key }: { key: string }) => {
      try {
        return await prisma.contentBlock.findUnique({ where: { key } });
      } catch (error) {
        return null;
      }
    },
  },
  Mutation: {
    upsertContentBlock: async (_: unknown, { key, input }: { key: string; input: { payload: unknown } }) => {
      return await prisma.contentBlock.upsert({
        where: { key },
        update: { payload: input.payload as object },
        create: { key, payload: input.payload as object },
      });
    },
    deleteContentBlock: async (_: unknown, { key }: { key: string }) => {
      await prisma.contentBlock.delete({ where: { key } });
      return true;
    },
  },
};

// User Resolvers
const UserResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      return await getUserFromContext(context);
    },
    user: async (_: unknown, { id }: { id: number }) => {
      return await prisma.user.findUnique({ where: { id } });
    },
    users: async (_: unknown, { page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) => {
      const total = await prisma.user.count();
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return {
        users,
        total,
        page,
        pageSize,
        hasMore: total > page * pageSize,
      };
    },
  },
  Mutation: {
    register: async (_: unknown, { input }: { input: { email: string; password: string; name: string; avatar?: string } }) => {
      // 檢查郵箱是否已存在
      const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
      if (existingUser) {
        throw new Error('該郵箱已被註冊');
      }

      // 密碼加密
      const passwordHash = await bcrypt.hash(input.password, 10);

      // 創建用戶
      const user = await prisma.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name,
          avatar: input.avatar || '👤',
        },
      });

      // 生成 token
      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return { user, token };
    },
    login: async (_: unknown, { input }: { input: { email: string; password: string } }) => {
      // 查找用戶
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw new Error('郵箱或密碼錯誤');
      }

      // 檢查是否被封禁
      if (user.isBanned) {
        throw new Error('該帳號已被封禁');
      }

      // 驗證密碼
      const isValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!isValid) {
        throw new Error('郵箱或密碼錯誤');
      }

      // 生成 token
      const token = jwt.sign(
        { userId: user.id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return { user, token };
    },
    updateProfile: async (_: unknown, { input }: { input: { name?: string; avatar?: string; gameHours?: number } }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      return await prisma.user.update({
        where: { id: user.id },
        data: input,
      });
    },
    updateGameHours: async (_: unknown, { hours }: { hours: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      return await prisma.user.update({
        where: { id: user.id },
        data: { gameHours: hours },
      });
    },
  },
  User: {
    reviewCount: async (parent: { id: number }) => {
      return await prisma.review.count({ where: { userId: parent.id, isApproved: true } });
    },
    reviews: async (parent: { id: number }) => {
      return await prisma.review.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      });
    },
  },
};

// Review Resolvers
const ReviewResolvers = {
  Query: {
    reviews: async (_: unknown, { page = 1, pageSize = 10, sortBy = 'newest' }: { page?: number; pageSize?: number; sortBy?: string }, context: Context) => {
      const where = { isApproved: true, isHidden: false };

      const total = await prisma.review.count({ where });

      let orderBy: object;
      switch (sortBy) {
        case 'oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'highest':
          orderBy = { rating: 'desc' };
          break;
        case 'lowest':
          orderBy = { rating: 'asc' };
          break;
        case 'helpful':
          orderBy = { likes: { _count: 'desc' } };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }

      const reviews = await prisma.review.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: true,
          likes: true,
          replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        },
      });

      // 計算統計數據
      const allReviews = await prisma.review.findMany({ where });
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;
      const recommendedCount = allReviews.filter(r => r.isRecommended).length;
      const recommendedPercent = totalReviews > 0
        ? (recommendedCount / totalReviews) * 100
        : 0;

      // 評分分佈 [1星數量, 2星數量, 3星數量, 4星數量, 5星數量]
      const ratingDistribution = [1, 2, 3, 4, 5].map(
        rating => allReviews.filter(r => r.rating === rating).length
      );

      // 標記當前用戶是否已點贊
      const reviewsWithLikeStatus = reviews.map(review => ({
        ...review,
        isLikedByMe: context.userId ? review.likes.some(like => like.userId === context.userId) : false,
        likeCount: review.likes.length,
        replyCount: review.replies.length,
      }));

      return {
        reviews: reviewsWithLikeStatus,
        total,
        page,
        pageSize,
        hasMore: total > page * pageSize,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          recommendedPercent: Math.round(recommendedPercent),
          ratingDistribution,
        },
      };
    },
    review: async (_: unknown, { id }: { id: number }, context: Context) => {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: true,
          likes: true,
          replies: { include: { user: true }, orderBy: { createdAt: 'asc' } },
        },
      });

      if (!review) return null;

      return {
        ...review,
        isLikedByMe: context.userId ? review.likes.some(like => like.userId === context.userId) : false,
        likeCount: review.likes.length,
        replyCount: review.replies.length,
      };
    },
    myReviews: async (_: unknown, __: unknown, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      return await prisma.review.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          likes: true,
          replies: { include: { user: true } },
        },
      });
    },
    reviewReports: async (_: unknown, { status }: { status?: string }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user || !user.isAdmin) {
        throw new Error('需要管理員權限');
      }

      const where = status ? { status } : {};
      return await prisma.reviewReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { review: { include: { user: true } }, user: true },
      });
    },
  },
  Mutation: {
    createReview: async (_: unknown, { input }: { input: { content: string; rating: number; isRecommended: boolean } }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      // 檢查是否已發過評價
      const existingReview = await prisma.review.findFirst({
        where: { userId: user.id },
      });
      if (existingReview) {
        throw new Error('您已經發表過評價，可以編輯現有評價');
      }

      return await prisma.review.create({
        data: {
          content: input.content,
          rating: Math.min(5, Math.max(1, input.rating)),
          isRecommended: input.isRecommended,
          userId: user.id,
          isApproved: false, // 需要審核
        },
        include: { user: true, likes: true, replies: true },
      });
    },
    updateReview: async (_: unknown, { id, input }: { id: number; input: { content?: string; rating?: number; isRecommended?: boolean } }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      const review = await prisma.review.findUnique({ where: { id } });
      if (!review) {
        throw new Error('評價不存在');
      }
      if (review.userId !== user.id && !user.isAdmin) {
        throw new Error('無權編輯此評價');
      }

      const updateData: { content?: string; rating?: number; isRecommended?: boolean } = {};
      if (input.content !== undefined) updateData.content = input.content;
      if (input.rating !== undefined) updateData.rating = Math.min(5, Math.max(1, input.rating));
      if (input.isRecommended !== undefined) updateData.isRecommended = input.isRecommended;

      return await prisma.review.update({
        where: { id },
        data: updateData,
        include: { user: true, likes: true, replies: true },
      });
    },
    deleteReview: async (_: unknown, { id }: { id: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      const review = await prisma.review.findUnique({ where: { id } });
      if (!review) {
        throw new Error('評價不存在');
      }
      if (review.userId !== user.id && !user.isAdmin) {
        throw new Error('無權刪除此評價');
      }

      await prisma.review.delete({ where: { id } });
      return true;
    },
    createReviewReply: async (_: unknown, { input }: { input: { content: string; reviewId: number } }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      return await prisma.reviewReply.create({
        data: {
          content: input.content,
          reviewId: input.reviewId,
          userId: user.id,
        },
        include: { user: true },
      });
    },
    deleteReviewReply: async (_: unknown, { id }: { id: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      const reply = await prisma.reviewReply.findUnique({ where: { id } });
      if (!reply) {
        throw new Error('回覆不存在');
      }
      if (reply.userId !== user.id && !user.isAdmin) {
        throw new Error('無權刪除此回覆');
      }

      await prisma.reviewReply.delete({ where: { id } });
      return true;
    },
    likeReview: async (_: unknown, { reviewId }: { reviewId: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      // 檢查是否已點贊
      const existingLike = await prisma.reviewLike.findUnique({
        where: { reviewId_userId: { reviewId, userId: user.id } },
      });
      if (existingLike) {
        throw new Error('您已經點過贊了');
      }

      await prisma.reviewLike.create({
        data: { reviewId, userId: user.id },
      });

      return await prisma.review.findUnique({
        where: { id: reviewId },
        include: { user: true, likes: true, replies: { include: { user: true } } },
      });
    },
    unlikeReview: async (_: unknown, { reviewId }: { reviewId: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      await prisma.reviewLike.deleteMany({
        where: { reviewId, userId: user.id },
      });

      return await prisma.review.findUnique({
        where: { id: reviewId },
        include: { user: true, likes: true, replies: { include: { user: true } } },
      });
    },
    reportReview: async (_: unknown, { input }: { input: { reviewId: number; reason: string } }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user) {
        throw new Error('請先登入');
      }

      return await prisma.reviewReport.create({
        data: {
          reviewId: input.reviewId,
          userId: user.id,
          reason: input.reason,
        },
        include: { review: { include: { user: true } }, user: true },
      });
    },
    approveReview: async (_: unknown, { id }: { id: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user || !user.isAdmin) {
        throw new Error('需要管理員權限');
      }

      return await prisma.review.update({
        where: { id },
        data: { isApproved: true },
        include: { user: true, likes: true, replies: true },
      });
    },
    hideReview: async (_: unknown, { id }: { id: number }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user || !user.isAdmin) {
        throw new Error('需要管理員權限');
      }

      return await prisma.review.update({
        where: { id },
        data: { isHidden: true },
        include: { user: true, likes: true, replies: true },
      });
    },
    resolveReport: async (_: unknown, { id, action }: { id: number; action: string }, context: Context) => {
      const user = await getUserFromContext(context);
      if (!user || !user.isAdmin) {
        throw new Error('需要管理員權限');
      }

      const report = await prisma.reviewReport.findUnique({ where: { id } });
      if (!report) {
        throw new Error('舉報不存在');
      }

      // 如果選擇隱藏評價
      if (action === 'hide') {
        await prisma.review.update({
          where: { id: report.reviewId },
          data: { isHidden: true },
        });
      }

      return await prisma.reviewReport.update({
        where: { id },
        data: { status: action === 'hide' ? 'resolved' : 'dismissed' },
        include: { review: { include: { user: true } }, user: true },
      });
    },
  },
  Review: {
    likeCount: async (parent: { id: number; likeCount?: number }) => {
      if (parent.likeCount !== undefined) return parent.likeCount;
      return await prisma.reviewLike.count({ where: { reviewId: parent.id } });
    },
    replyCount: async (parent: { id: number; replyCount?: number }) => {
      if (parent.replyCount !== undefined) return parent.replyCount;
      return await prisma.reviewReply.count({ where: { reviewId: parent.id } });
    },
  },
};

const Query = {
  ...CategoryResolvers.Query,
  ...PostResolvers.Query,
  ...CommentResolvers.Query,
  ...AnnouncementResolvers.Query,
  ...DashboardResolvers.Query,
  ...ContentBlockResolvers.Query,
  ...UserResolvers.Query,
  ...ReviewResolvers.Query,
};

const Mutation = {
  ...CategoryResolvers.Mutation,
  ...PostResolvers.Mutation,
  ...CommentResolvers.Mutation,
  ...AnnouncementResolvers.Mutation,
  ...ContentBlockResolvers.Mutation,
  ...UserResolvers.Mutation,
  ...ReviewResolvers.Mutation,
};

const resolvers = {
  JSON: JSONScalar,
  Query,
  Mutation,
  Category: CategoryResolvers.Category,
  Post: PostResolvers.Post,
  User: UserResolvers.User,
  Review: ReviewResolvers.Review,
};

export default resolvers;

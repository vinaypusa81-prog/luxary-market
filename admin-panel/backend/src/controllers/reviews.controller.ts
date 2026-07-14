import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { prisma } from '../config/prisma';
import { ReviewStatus as PrismaReviewStatus } from '@prisma/client';

// Helper to recalculate Mongoose product ratings
const updateProductRating = async (productId: string) => {
  const reviews = await Review.find({ productId, status: 'APPROVED' });
  const reviewCount = reviews.length;
  const avgRating = reviewCount > 0 ? reviews.reduce((acc, cur) => acc + cur.rating, 0) / reviewCount : 0;

  await Product.findByIdAndUpdate(productId, {
    rating: parseFloat(avgRating.toFixed(1)),
    reviewCount
  });
};

export const getReviews = async (req: Request, res: Response) => {
  const { status, page = '1', limit = '10' } = req.query;

  try {
    const query: any = { isDeleted: false };
    if (status) query.status = status;

    const p = Math.max(1, parseInt(page as string, 10));
    const l = Math.max(1, parseInt(limit as string, 10));
    const skip = (p - 1) * l;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
      Review.countDocuments(query),
    ]);

    res.json({
      data: reviews,
      pagination: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const moderateReview = async (req: Request, res: Response) => {
  const { status } = req.body; // APPROVED or REJECTED

  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.status = status;
    await review.save();

    // Sync status to PostgreSQL
    if (review.postgresId) {
      let pgStatus: PrismaReviewStatus = PrismaReviewStatus.PENDING;
      if (status === 'APPROVED') pgStatus = PrismaReviewStatus.APPROVED;
      else if (status === 'REJECTED') pgStatus = PrismaReviewStatus.REJECTED;

      await prisma.review.update({
        where: { id: review.postgresId },
        data: { status: pgStatus }
      });
    }

    // Recalculate ratings
    await updateProductRating(review.productId);

    res.json({ message: `Review moderated successfully: set to ${status.toLowerCase()}`, review });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const replyToReview = async (req: Request, res: Response) => {
  const { reply } = req.body;

  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.reply = reply;
    review.replyAt = new Date();
    await review.save();

    res.json({ message: 'Reply posted successfully', review });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReview = async (req: Request, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isDeleted = true;
    await review.save();

    // Delete in Postgres too
    if (review.postgresId) {
      await prisma.review.delete({
        where: { id: review.postgresId }
      });
    }

    // Recalculate ratings
    await updateProductRating(review.productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

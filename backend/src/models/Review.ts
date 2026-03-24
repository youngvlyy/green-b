import { Schema, model, Document } from 'mongoose';

export interface IReviewImage {
  url: string;
  order: number;
}

export interface IReview extends Document {
  productId: number;    // PostgreSQL products.id 참조
  memberId: string;     // PostgreSQL members.id (UUID)
  memberName: string;   // 작성 시점 스냅샷

  rating: number;       // 1~5점
  title?: string;
  body: string;

  images: IReviewImage[];

  // 구매 인증
  isVerifiedPurchase: boolean;
  orderId?: string;     // PostgreSQL orders.id

  // 유용성 투표
  helpfulCount: number;
  notHelpfulCount: number;

  // 관리자 처리
  isHidden: boolean;
  hiddenReason?: string;
  adminNote?: string;

  // 답글 (판매자 또는 관리자)
  reply?: {
    body: string;
    repliedAt: Date;
    repliedBy: string;  // 'admin' | 'seller'
  };

  createdAt: Date;
  updatedAt: Date;
}

const ReviewImageSchema = new Schema<IReviewImage>(
  {
    url:   { type: String, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const ReviewSchema = new Schema<IReview>(
  {
    productId:  { type: Number, required: true, index: true },
    memberId:   { type: String, required: true, index: true },
    memberName: { type: String, required: true },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, maxlength: 100 },
    body:  { type: String, required: true, maxlength: 2000 },

    images: { type: [ReviewImageSchema], default: [] },

    isVerifiedPurchase: { type: Boolean, default: false },
    orderId:            { type: String },

    helpfulCount:    { type: Number, default: 0, min: 0 },
    notHelpfulCount: { type: Number, default: 0, min: 0 },

    isHidden:    { type: Boolean, default: false, index: true },
    hiddenReason: { type: String },
    adminNote:   { type: String },

    reply: {
      body:       { type: String },
      repliedAt:  { type: Date },
      repliedBy:  { type: String },
    },
  },
  { timestamps: true }
);

// 제품별 최신순 조회
ReviewSchema.index({ productId: 1, createdAt: -1 });
// 제품별 평점 집계용
ReviewSchema.index({ productId: 1, rating: 1 });
// 회원이 작성한 리뷰 조회
ReviewSchema.index({ memberId: 1, createdAt: -1 });

export const Review = model<IReview>('Review', ReviewSchema);

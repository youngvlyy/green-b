import { Schema, model, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  // 회원이면 memberId, 비회원이면 sessionId로 식별
  memberId?:  string;
  sessionId?: string;

  keyword: string;          // 검색어 (원문)
  keywordNormalized: string; // 소문자·공백 정리 버전 (중복 집계용)

  // 검색 결과
  resultCount: number;
  hasResults:  boolean;

  // 사용자 행동
  clickedProductId?: number;  // 결과 중 클릭한 제품
  clickedAt?:        Date;

  // 요청 컨텍스트
  ip?:       string;
  device?:   'mobile' | 'tablet' | 'desktop';
  source?:   'header' | 'page' | 'suggestion'; // 어디서 검색했는지

  createdAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    memberId:          { type: String, index: true },
    sessionId:         { type: String, index: true },

    keyword:           { type: String, required: true },
    keywordNormalized: { type: String, required: true, index: true },

    resultCount: { type: Number, required: true, default: 0 },
    hasResults:  { type: Boolean, required: true, default: false },

    clickedProductId: { type: Number },
    clickedAt:        { type: Date },

    ip:     { type: String },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'] },
    source: { type: String, enum: ['header', 'page', 'suggestion'] },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// 인기 검색어 집계 (keyword 빈도 COUNT)
SearchHistorySchema.index({ keywordNormalized: 1, createdAt: -1 });
// 회원 검색 기록 최신순
SearchHistorySchema.index({ memberId: 1, createdAt: -1 });
// 검색 결과 없음 분석 (콘텐츠 개선용)
SearchHistorySchema.index({ hasResults: 1, createdAt: -1 });
// 검색 기록 30일 TTL 자동 삭제 (비회원)
SearchHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

// 저장 전 keyword 정규화
SearchHistorySchema.pre<ISearchHistory>('save', function () {
  this.keywordNormalized = this.keyword.trim().toLowerCase().replace(/\s+/g, ' ');
});

export const SearchHistory = model<ISearchHistory>('SearchHistory', SearchHistorySchema);

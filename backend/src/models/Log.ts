import { Schema, model, Document } from 'mongoose';

// 로그 레벨
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// 로그 카테고리
export type LogCategory =
  | 'auth'        // 로그인, 로그아웃, 토큰 발급
  | 'order'       // 주문 생성, 상태 변경
  | 'payment'     // 결제 시도, 성공, 실패
  | 'inventory'   // 재고 변동
  | 'admin'       // 관리자 작업
  | 'system'      // 서버 에러, 외부 API 에러
  | 'security';   // 비정상 접근, 권한 오류

export interface ILog extends Document {
  level:    LogLevel;
  category: LogCategory;
  action:   string;          // 예: 'order.status_changed', 'payment.failed'
  message:  string;

  // 요청 컨텍스트
  requestId?: string;        // 요청 추적용 UUID
  memberId?:  string;        // 행위자 (없으면 비회원 또는 시스템)
  ip?:        string;
  userAgent?: string;
  method?:    string;        // HTTP method
  path?:      string;        // 요청 경로

  // 비즈니스 컨텍스트
  resourceType?: string;     // 예: 'order', 'product', 'member'
  resourceId?:   string;     // 해당 리소스 ID

  // 상세 데이터 (구조 자유)
  meta?: Record<string, unknown>;

  // 에러 전용
  errorCode?:  string;
  errorStack?: string;

  // 응답 시간
  durationMs?: number;

  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    level:    { type: String, required: true, enum: ['debug','info','warn','error','fatal'] },
    category: { type: String, required: true, enum: ['auth','order','payment','inventory','admin','system','security'] },
    action:   { type: String, required: true },
    message:  { type: String, required: true },

    requestId: { type: String, index: true },
    memberId:  { type: String, index: true },
    ip:        { type: String },
    userAgent: { type: String },
    method:    { type: String },
    path:      { type: String },

    resourceType: { type: String },
    resourceId:   { type: String },

    meta: { type: Schema.Types.Mixed },

    errorCode:  { type: String },
    errorStack: { type: String },

    durationMs: { type: Number },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // 로그는 수정 없음
  }
);

// 레벨·시간 기준 조회 (에러 모니터링)
LogSchema.index({ level: 1, createdAt: -1 });
// 카테고리별 조회
LogSchema.index({ category: 1, createdAt: -1 });
// 특정 리소스 히스토리 추적
LogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
// 오래된 로그 자동 삭제 (90일 TTL)
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Log = model<ILog>('Log', LogSchema);

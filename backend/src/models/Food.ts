import { Schema, model, Document } from 'mongoose';

// 알레르기 항목 (식품의약품안전처 22종 기준)
export const ALLERGENS = [
  '난류', '우유', '메밀', '땅콩', '대두', '밀', '고등어', '게', '새우',
  '돼지고기', '복숭아', '토마토', '아황산류', '호두', '닭고기', '쇠고기',
  '오징어', '조개류(굴)', '조개류(전복)', '조개류(홍합)', '잣', '견과류',
] as const;

export type Allergen = typeof ALLERGENS[number];

export interface IFood extends Document {
  productId: number;       // PostgreSQL products.id 참조
  name: string;

  // 유통기한
  expiresAt: Date;         // 소비기한 (절대 날짜)
  bestBefore?: Date;       // 품질유지기한 (선택)
  manufacturedAt?: Date;   // 제조일자

  // 원산지
  origin: {
    country: string;       // 예: '대한민국'
    region?: string;       // 예: '전라남도 나주시'
    farm?: string;         // 예: '나주 행복농장'
  };

  // 알레르기 정보
  allergens: Allergen[];                 // 포함 알레르기
  mayContain: Allergen[];               // 혼입 가능성
  allergenNote?: string;                // 자유 기재 (예: "같은 시설에서 견과류 가공")

  // 영양 정보 (1회 제공량 기준)
  nutrition?: {
    servingSize: number;   // g 또는 ml
    calories: number;      // kcal
    carbs: number;         // g
    sugars: number;        // g
    protein: number;       // g
    fat: number;           // g
    saturatedFat: number;  // g
    transFat: number;      // g
    sodium: number;        // mg
  };

  ingredients?: string;    // 원재료명
  storageMethod?: string;  // 보관 방법 (예: '냉장 0~10℃')

  createdAt: Date;
  updatedAt: Date;
}

const FoodSchema = new Schema<IFood>(
  {
    productId: { type: Number, required: true, unique: true, index: true },
    name:      { type: String, required: true },

    expiresAt:      { type: Date, required: true },
    bestBefore:     { type: Date },
    manufacturedAt: { type: Date },

    origin: {
      country: { type: String, required: true },
      region:  { type: String },
      farm:    { type: String },
    },

    allergens:    { type: [String], enum: ALLERGENS, default: [] },
    mayContain:   { type: [String], enum: ALLERGENS, default: [] },
    allergenNote: { type: String },

    nutrition: {
      servingSize:   { type: Number },
      calories:      { type: Number },
      carbs:         { type: Number },
      sugars:        { type: Number },
      protein:       { type: Number },
      fat:           { type: Number },
      saturatedFat:  { type: Number },
      transFat:      { type: Number },
      sodium:        { type: Number },
    },

    ingredients:   { type: String },
    storageMethod: { type: String },
  },
  { timestamps: true }
);

// 유통기한 만료 조회 인덱스
FoodSchema.index({ expiresAt: 1 });
// 알레르기 필터 인덱스
FoodSchema.index({ allergens: 1 });

export const Food = model<IFood>('Food', FoodSchema);

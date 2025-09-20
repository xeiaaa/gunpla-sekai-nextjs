export interface ProductVariant {
  product_id: number;
  id: number;
  title: string;
  price: string;
  compare_at_price: number | null;
}
export interface ProductImage {
  product_id: number;
  id: number;
  alt: string;
  price: string;
  width: number;
  heigth: number;
  src: string;
}

export type ProductShort = {
  id: number;
  title: string;
  variants: ProductVariant[];
  image: ProductImage;
  body_html: string;
};

export enum PAINT_TYPE {
  COMMERCIAL = "COMMERCIAL",
  OWN = "OWN",
}

export enum ALPHA_MODE {
  OPAQUE = "OPAQUE",
  BLEND = "BLEND",
}

export interface MaterialData {
  color: string;
  isClear: boolean;
  alphaMode: ALPHA_MODE;
  finish: FINISH_TYPE;
  paint: Paint;
}

export enum FINISH_TYPE {
  MATTE = "matte",
  GLOSS = "gloss",
  SEMIGLOSS = "semigloss",
  PEARL = "pearl",
  CANDY = "candy",
  METALLIC = "metallic",
  DEFAULT = "default",
}

export interface Paint {
  name: string;
  code?: string;
  finish: FINISH_TYPE;
  color: string;
  type: PAINT_TYPE;
}

export interface Part {
  slug: string;
  label: string;
  materials: [string, string][];
}

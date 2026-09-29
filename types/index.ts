export interface LoginDto {
  mobile: string;
  password: string;
}

export interface RegisterDto {
  mobile: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role?: string;
  mobile?: string;
  [key: string]: unknown;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  gender?: string | null;
  role?: string;
  mobile?: string;
}

export interface ProductDto {
  name?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  colors?: string[] | null;
  sizes?: string[] | null;
  isActive: boolean;
  categoryId: number;
  brandId?: number | null;
}

export interface BrandDto {
  name?: string | null;
}

export interface CategoryDto {
  name?: string | null;
  parentId?: number | null;
}

export interface SizeDto {
  name: string;
}

export interface AddressDto {
  province: string;
  city: string;
  street: string;
  alley?: string | null;
  number: string;
  postalCode: string;
  floor?: number | null;
  unit?: number | null;
}

export interface ProfileDto {
  firstName: string;
  lastName: string;
  gender?: string | null;
  nationalId?: string | null;
  isForeignNational?: boolean;
  birthDay?: number | null;
  birthMonth?: number | null;
  birthYear?: number | null;
}

export interface SpecialOfferDto {
  name: string;
  color?: string | null;
}

export interface SpecialOfferProductDto {
  productId: number;
  specialPrice: number;
}

export interface ProductSpecificationDto {
  title: string;
  description: string;
}

export interface CommentDto {
  text: string;
  parentId?: number | null;
}

export interface CartItemDto {
  productId: number;
  quantity: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
}

export interface RatingDto {
  score: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

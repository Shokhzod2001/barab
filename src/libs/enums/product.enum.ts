export enum ProductStatus {
  PAUSE = "PAUSE",
  PROCESS = "PROCESS",
  DELETE = "DELETE",
}

export enum ProductCategory {
  BURGERS = "BURGERS",
  CHICKEN = "CHICKEN",
  PIZZA = "PIZZA",
  MEXICAN = "MEXICAN",
  SIDES = "SIDES",
  BREAKFAST = "BREAKFAST",
  SALADS = "SALADS",
  DESSERTS = "DESSERTS",
  BEVERAGES = "BEVERAGES",
  SANDWICHES = "SANDWICHES",
  APPETIZERS = "APPETIZERS",
}

export enum ProductTime {
  BREAKFAST = "BREAKFAST",
  LUNCH = "LUNCH",
  DINNER = "DINNER",
  ALL_DAY = "ALL_DAY",
}

export enum ProductSpice {
  NONE = "NONE",
  MEDIUM = "MEDIUM",
  HOT = "HOT",
}

export enum ProductSize {
  SMALL = "SMALL",
  REGULAR = "REGULAR",
  LARGE = "LARGE",
}

export enum ProductVolume {
  HALF = 0.5,
  ONE = 1,
  ONE_POINT_TWO = 1.2,
  ONE_POINT_FIVE = 1.5,
  TWO = 2,
}

// Additional utility enums
export enum SortOptions {
  POPULAR = "POPULAR",
  PRICE_LOW_HIGH = "PRICE_LOW_HIGH",
  PRICE_HIGH_LOW = "PRICE_HIGH_LOW",
  ALPHABETICAL = "ALPHABETICAL",
  NEWEST = "NEWEST",
}

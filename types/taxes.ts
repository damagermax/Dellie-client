export interface TaxRateInput {
  name: string;
  value: number;
}

export interface TaxCreateInput {
  description: string;
  items: TaxRateInput[];
  status?: "active" | "inactive";
}

export interface TaxUpdateInput extends Partial<TaxCreateInput> {
  id: string;
}

export interface TaxRate {
  id?: string;
  name: string;
  value: number;
}

export interface Tax {
  id: string;
  description: string;
  items: TaxRate[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

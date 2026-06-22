import { VariantCombination } from "./ProductFormModal";

export const generateVariants = (attributes: { name: string; options: string[] }[]): VariantCombination[] => {
  const validAttrs = attributes.filter((a) => a.options.length > 0 && a.name.trim());

  if (!validAttrs.length) return [];

  // start with empty combination
  let combinations: Record<string, string>[] = [{}];

  for (const attr of validAttrs) {
    const next: Record<string, string>[] = [];

    for (const combo of combinations) {
      for (const option of attr.options) {
        next.push({
          ...combo,
          [attr.name]: option,
        });
      }
    }

    combinations = next;
  }

  return combinations.map((combo) => {
    const optionValues = Object.entries(combo).map(([option, value]) => ({
      option: option.charAt(0).toUpperCase() + option.slice(1),
      value: value.charAt(0).toUpperCase() + value.slice(1),
    }));

    const key = Object.values(combo).join("_").trim().toUpperCase();

    const name = Object.values(combo).join(" / ");

    return {
      key,
      name,
      costPrice: 0,
      sellingPrice: 0,
      weight: 0,
      image: null,
      optionValues,
      stock: null,
      //attributes: combo,
    };
  });
};

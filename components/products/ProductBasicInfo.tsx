import { Form, FormInstance } from "antd";
import { SearchableCategorySelect } from "../categories/SearchableCategorySelect";
import { InputFormItem, TextAreaFormItem } from "../ui/AppFormItems";
import { CategoryType } from "@/types/category";

export function ProductBasicInfo({ form, onChange }: { form: FormInstance; onChange: (changedValues: Record<string, unknown>, allValues: Record<string, unknown>) => void }) {
  return (
    <section className=" p-5 bg-white  ">
      <Form form={form} layout="vertical" onValuesChange={onChange}>
        <InputFormItem label="Name" name="name" placeholder="Enter product name. Eg. Red T-Shirt" />

        <div className="grid grid-cols-2  lg:grid-cols-4 gap-x-5">
          <InputFormItem type="number" label="Cost Price" name="costPrice" placeholder="Enter product cost price" />
          <InputFormItem type="number" label="Selling Price" name="sellingPrice" placeholder="Enter product selling price" />
          <InputFormItem label="Profit" name="profit" disable />
          <InputFormItem label="Profit Margin" name="profitMargin" disable />
        </div>

        <Form.Item label="Tags" name="tagIds">
          <SearchableCategorySelect type={CategoryType.PRODUCT} />
        </Form.Item>
        <Form.Item label="Categories" name="categoryIds">
          <SearchableCategorySelect type={CategoryType.PRODUCT} />
        </Form.Item>
        <TextAreaFormItem label="Description (Optional)" name="description" placeholder="Enter product description" />
      </Form>
    </section>
  );
}

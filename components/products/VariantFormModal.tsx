import React from "react";
import { AppModal, ModalProps } from "../ui/AppModal";

import { useState } from "react";
import { Button, Input, Tag } from "antd";

interface Props extends ModalProps {}
import { RiDeleteBin3Line } from "react-icons/ri";

import { CloseOutlined } from "@ant-design/icons";
import { VariantCombination } from "./ProductFormModal";
import { generateVariants } from "./generatevariants";

interface Props extends ModalProps {
  updateVariantCombinations: (combinations: VariantCombination[]) => void;
}

export interface VariantAttribute {
  id: string;
  name: string;
  options: string[];
  input?: string;
}

export const VariantFormModal = ({ toggle, open, updateVariantCombinations }: Props) => {
  const [attributes, setAttributes] = useState<VariantAttribute[]>([]);

  const addAttribute = () => {
    setAttributes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        options: [],
        input: "",
      },
    ]);
  };

  const updateAttributeName = (id: string, value: string) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.id === id
          ? {
              ...attr,
              name: value,
            }
          : attr,
      ),
    );
  };

  const handleOptionChange = (id: string, value: string) => {
    // detect comma
    if (value.includes(",")) {
      const values = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      setAttributes((prev) =>
        prev.map((attr) => {
          if (attr.id !== id) return attr;

          const merged = [...attr.options];

          values.forEach((item) => {
            if (!merged.includes(item)) {
              merged.push(item);
            }
          });

          return {
            ...attr,
            options: merged,
            input: "",
          };
        }),
      );

      return;
    }

    setAttributes((prev) =>
      prev.map((attr) =>
        attr.id === id
          ? {
              ...attr,
              input: value,
            }
          : attr,
      ),
    );
  };

  const removeOption = (attributeId: string, option: string) => {
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.id === attributeId
          ? {
              ...attr,
              options: attr.options.filter((item) => item !== option),
            }
          : attr,
      ),
    );
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((attr) => attr.id !== id));
  };

  const handleSubmit = () => {
    const formatted = attributes.map((item) => ({
      name: item.name,
      options: item.options,
    }));

    const combinations = generateVariants(formatted);
    updateVariantCombinations(combinations);

    toggle();
  };

  const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();

      const value = e.currentTarget.value.trim();

      if (!value) return;

      setAttributes((prev) =>
        prev.map((attr) => {
          if (attr.id !== id) return attr;

          // prevent duplicates
          if (attr.options.includes(value)) {
            return {
              ...attr,
              input: "",
            };
          }

          return {
            ...attr,
            options: [...attr.options, value],
            input: "",
          };
        }),
      );
    }
  };
  return (
    <AppModal width={600} okText="Continue" onOk={handleSubmit} title="Variant Options" toggle={toggle} open={open}>
      <div className="border-t border-blue-100 px-5 py-5 space-y-5">
        {attributes.map((attribute) => (
          <div key={attribute.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Input placeholder="Attribute name e.g Color" size="small" value={attribute.name} onChange={(e) => updateAttributeName(attribute.id, e.target.value)} />
              <RiDeleteBin3Line size={20} className=" text-gray-500  cursor-pointer" onClick={() => removeAttribute(attribute.id)} />
            </div>

            <div className="border border-gray-300 rounded-md px-2 py-1.5 flex items-center flex-wrap gap-y-2 ">
              {attribute.options.map((option) => (
                <Tag key={option} closable closeIcon={<CloseOutlined />} onClose={() => removeOption(attribute.id, option)} className="!px-2 ">
                  {option}
                </Tag>
              ))}

              <input
                disabled={!attribute.name}
                value={attribute.input}
                onChange={(e) => handleOptionChange(attribute.id, e.target.value)}
                placeholder="Type option and press comma"
                onKeyDown={(e) => handleOptionKeyDown(e, attribute.id)}
                className="outline-none border-none flex-1 min-w-[150px]"
              />
            </div>
          </div>
        ))}

        <Button block onClick={addAttribute}>
          Add Attribute
        </Button>
      </div>
    </AppModal>
  );
};

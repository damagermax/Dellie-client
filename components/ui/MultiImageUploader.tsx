"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Upload, UploadFile, UploadProps } from "antd";
import { useState } from "react";

type ImageUploaderProps = {
  maxCount?: number;
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  multiple?: boolean;
  label?: string;
  description?: string;
};

export default function MultiImageUploader({ maxCount = 8, value = [], onChange, multiple = true, label, description }: ImageUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>(value);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onChange?.(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 0 }}>{label || "Upload"}</div>
      <div style={{ marginTop: 0, fontSize: 10 }}>{description}</div>
    </div>
  );

  return (
    <div className=" !w-[100px] !h-[100px] !flex  bg-gray-100      border-dashed border-gray-200 border-2 rounded-lg">
      <Upload
        listType="picture-card"
        className="[&_.ant-upload-list-picture-card-container]:flex [&_.ant-upload-list-picture-card-container]:flex-row [&_.ant-upload-list-picture-card-container]:flex-wrap"
        style={{ width: "100%", height: "100%" }}
        fileList={fileList}
        onChange={handleChange}
        multiple={multiple}
        beforeUpload={() => false}
        onRemove={() => {
          const newFileList = [...fileList];
          newFileList.pop();
          setFileList(newFileList);
          onChange?.(newFileList);
          return false;
        }}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>
    </div>
  );
}

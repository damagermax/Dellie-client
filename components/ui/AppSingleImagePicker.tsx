"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Image, Upload, UploadFile, UploadProps } from "antd";
import { RcFile } from "antd/es/upload";
import { CSSProperties, useEffect, useState } from "react";

interface AppSingleImagePickerProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  className?: string;
  size?: number;
}

const AppSingleImagePicker: React.FC<AppSingleImagePickerProps> = ({
  value = [],
  onChange,
  className = "",
  size = 60, // Default size in pixels
}) => {
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const file = value[0];
    if (!file) {
      setPreviewImage("");
      return;
    }

    if (file.url) {
      setPreviewImage(file.url);
      return;
    }

    if (file.originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage((e.target?.result as string) || "");
      };
      reader.readAsDataURL(file.originFileObj as RcFile);
    }
  }, [value]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const file = newFileList[newFileList.length - 1];
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target?.result as string);
        };
        reader.readAsDataURL(file.originFileObj as RcFile);
      }
    } else {
      setPreviewImage("");
    }
    onChange?.(newFileList);
  };

  const handleRemove = () => {
    setPreviewImage("");
    onChange?.([]);
  };

  const uploadButton = (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
      }}
    >
      <UploadOutlined style={{ fontSize: "16px", color: "#8c8c8c" }} />
      <span style={{ fontSize: "12px", color: "#8c8c8c" }}>Image</span>
    </div>
  );

  const containerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    position: "relative",
    overflow: "hidden",
    border: "1px dashed #d9d9d9",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fafafa",
    cursor: "pointer",
  };

  return (
    <div style={containerStyle} className={className}>
      <Upload onRemove={handleRemove} accept="image/*" showUploadList={false} onChange={handleChange} beforeUpload={() => false} style={{ width: "100%", height: "100%" }}>
        {previewImage ? (
          <Image
            src={previewImage}
            alt="Preview"
            width={size}
            height={size}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            preview={false}
          />
        ) : (
          uploadButton
        )}
      </Upload>
    </div>
  );
};

export default AppSingleImagePicker;

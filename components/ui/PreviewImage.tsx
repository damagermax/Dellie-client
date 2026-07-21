import { Image as AntdImage } from "antd";
import NextImage from "next/image";
import { useState } from "react";
import ProductImagePlaceholder from "./ProductImagePlaceholder";

interface PreviewImageProp {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
}

const PreviewImage = ({ src = "/images/product.png", alt = "image", width = 35, height = 35 }: PreviewImageProp) => {
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const imageSrc = src || "";
  const shouldShowPlaceholder = !imageSrc || failed;

  if (shouldShowPlaceholder) {
    return (
      <div style={{ width, height }} className="overflow-hidden rounded">
        <ProductImagePlaceholder />
      </div>
    );
  }

  return (
    <>
      {/* PreviewGroup manages the modal preview */}
      <AntdImage.PreviewGroup
        preview={{
          visible,
          onVisibleChange: (vis) => setVisible(vis),
        }}
        items={[imageSrc]}
      />

      {/* Visible optimized image */}
      <div className="     !overflow-hidden">
        <NextImage
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          className=" !aspect-square !p-0 !m-0"
          onError={() => setFailed(true)}
          onClick={() => setVisible(true)}
          style={{
            objectFit: "cover",
            borderRadius: "4px",
            cursor: "pointer",
            aspectRatio: "1 / 1",
            overflow: "hidden",
          }}
        />
      </div>
    </>
  );
};

export default PreviewImage;

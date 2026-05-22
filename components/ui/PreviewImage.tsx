import { Image as AntdImage } from "antd";
import NextImage from "next/image";
import { useState } from "react";

interface PreviewImageProp {
  src?: string | null;
  alt?: string;
  width?: number;
  height?: number;
}

const PreviewImage = ({ src = "/images/product.png", alt = "image", width = 35, height = 35 }: PreviewImageProp) => {
  const [visible, setVisible] = useState(false);
  const imageSrc = src || "/images/product.png";

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

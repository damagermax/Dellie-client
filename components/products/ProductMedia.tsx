import PreviewImage from "../ui/PreviewImage";
import ImageUpload from "../ui/ImageUploader";
import { Spin } from "antd";

import { useDeleteProductMediaMutation, useAddProductMediaMutation } from "@/lib/redux/services";
import { useState } from "react";

interface media {
  url: string;
  key: string;
  type: string;
}

type ProductMediaProp = {
  productId: string;
  media: media[];
};

export function ProductMedia({ media, productId }: ProductMediaProp) {
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const [deleteProductMedia, { isLoading: deletingMedia }] = useDeleteProductMediaMutation();
  const [addProductMedia, { isLoading: addingMedia, isSuccess: addedMediaSuccess, error: addMediaError }] = useAddProductMediaMutation();

  const handleDeleteMedia = async (key: string) => {
    if (deletingMedia) return;

    await deleteProductMedia({ id: productId, key });
  };

  const handleAddMedia = async (files: File[]) => {
    if (addingMedia) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });

    await addProductMedia({ id: productId, data: formData });
  };

  return (
    <section className=" p-5 bg-white border-t border-gray-200 mt-5 ">
      <h3>Images and Videos</h3>

      <Spin spinning={deletingMedia || addingMedia}>
        <div className=" flex items-start justify-evenly p-1 gap-2 bg-gray-50 mt-3  rounded-lg border border-dashed border-gray-300">
          {media?.map((file: media) => {
            if (file.type.includes("image")) {
              return (
                <div className=" ">
                  <PreviewImage width={120} height={120} src={file.url} />
                  <p className=" p-1 text-center text-xs cursor-pointer text-red-600" onClick={() => handleDeleteMedia(file.key)}>
                    Remove
                  </p>
                </div>
              );
            } else {
              return <p></p>;
            }
          })}

          <ImageUpload label="Upload Media" width={70} height={70} onChange={handleAddMedia} key={addedMediaSuccess ? Date.now() : "default"} />
        </div>
      </Spin>
    </section>
  );
}

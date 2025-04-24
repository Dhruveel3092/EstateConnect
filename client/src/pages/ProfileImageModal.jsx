import React, { useState } from "react";
import { Button, Modal, Spin, Progress } from "antd";

export default function ProfileImageModal({
  modalOpen,
  setModalOpen,
  handleImageChange,
  handleUpload,
  image,
  setImage,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const startUpload = async () => {
    try {
      setUploading(true);

      await Promise.all([
        // Start the timeout with a shorter delay between updates
        (async () => {
          for (let i = 0; i <= 100; i += 10) {
            setUploadProgress(i);
            await new Promise((resolve) => setTimeout(resolve,400));
          }
        })(),
  
        // Start the handle upload process
        handleUpload(),
      ]);

    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setModalOpen(false);
    }
  };

  return (
    <div>
      <Modal
        title={uploading? "Adding Profile Image":"Add a Profile Image"}
        centered
        open={modalOpen}
        onOk={() => setModalOpen(false)}
        onCancel={() => {
            setModalOpen(false)
            setImage(null);
        }
            }
        footer={[
          <Button
            className="upload-btn"
            key="submit"
            type="primary"
            onClick={uploading ? null : startUpload}
            disabled={!image}
          >
            {uploading ? <Spin />  : "Upload Profile Picture"}
          </Button>,
        ]}
      >
        <div className="flex flex-col items-center justify-center">
          {image && !uploading && <p>{image.name}</p>}
          {!uploading && (
            <label
              className="border border-gray-900 py-2 px-4 cursor-pointer font-sans"
              htmlFor="image-upload"
            >
              Add an Image
            </label>
          )}
          <input hidden id="image-upload" type="file" onChange={handleImageChange} />
          {uploading && (
            <div className="p-5">
              <Progress type="circle" percent={uploadProgress} />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
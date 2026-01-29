import * as FileSystem from "expo-file-system";

export async function uploadToPresignedUrl(
  presignedUrl: string,
  fileUri: string,
  contentType: string,
) {
  const res = await FileSystem.uploadAsync(presignedUrl, fileUri, {
    httpMethod: "PUT",
    headers: {
      "Content-Type": contentType,
    },
  });

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`S3 upload failed: ${res.status}`);
  }
}

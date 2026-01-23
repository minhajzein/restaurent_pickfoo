import api from './axios';

export const uploadFile = async (file: File, folder: string = 'general') => {
  try {
    // Create FormData to send file
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('file', file);

    // Upload directly to backend
    const { data } = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return data.data.fileUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

export const deleteFile = async (fileUrl: string) => {
  try {
    const { data } = await api.delete('/upload', {
      data: { fileUrl }
    });
    return data;
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};

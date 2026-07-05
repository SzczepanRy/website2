export interface LoginFormI {
  login: string;
  password: string;
}

export interface RegisterFormI {
  login: string;
  email: string;
  password: string;
}

export interface UploadResponse {
  message: string;
  fileUrl?: string;
  fileId?: number;
}

export interface DirsI {
  dirs: string[];
}

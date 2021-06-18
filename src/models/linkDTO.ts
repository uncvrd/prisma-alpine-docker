export interface CreateLinkDTO {
  url: string;
  custom_ending?: string;
}

export interface UpdateLinkDTO {
  custom_ending: string;
  url: string;
}

export interface EncodedResponse {
  action: string;
  result: any;
}

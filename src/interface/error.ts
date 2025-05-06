export type IGenericErrorMessage = {
  path: string | undefined | number;
  message: string;
};

export type IGenericErrorResult = {
  message: string;
  errorMessages: IGenericErrorMessage[];
  statusCode: number;
};

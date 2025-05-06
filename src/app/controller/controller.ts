import httpStatus from 'http-status';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import Services from '../services/service';

const get_todos = catchAsync(async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Bad Request');
  }

  const result = await Services.getTodos(user_id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'payment created successfully',
    data: result,
  });
});

const create_users = catchAsync(async (req, res) => {
  const result = await Services.createUsers(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'payment created successfully',
    data: result,
  });
});

const Controller = {
  get_todos,
  create_users,
};

export default Controller;

import { logger } from '../../shared/logger';

const getTodos = async (user_id: string) => {
  logger.info(`get the Todos request with query ${JSON.stringify(user_id)}`);

  const url = `${process.env.TODOS_API}/todos`;
  const result = await fetch(url);
  const data_result = await result.json();
  return data_result;
};

const createUsers = async (user: object) => {
  logger.info(`create the user request with body ${JSON.stringify(user)}`);

  const url = `${process.env.TODOS_API}/users`;
  const result = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });
  const data_result = await result.json();
  return data_result;
};

const Services = {
  getTodos,
  createUsers,
};

export default Services;
